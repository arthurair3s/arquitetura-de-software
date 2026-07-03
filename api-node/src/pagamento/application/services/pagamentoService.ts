import type { IPagamentoRepository } from '../../domain/ports/IPagamentoRepository.js'
import type { IPagamentoService } from '../ports/IPagamentoService.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { IUsuarioService } from '../../../usuario/application/ports/IUsuarioService.js'
import type { IEventPublisher } from '../../../shared/application/ports/IEventPublisher.js'
import { Pagamento, PagamentoInvalidoError } from '../../domain/Pagamento.js'
import { Dinheiro } from '../../../shared/domain/value-objects/Dinheiro.js'

export class PagamentoAppService implements IPagamentoService {
  constructor(
    private readonly repository: IPagamentoRepository,
    private readonly pedidoService: IPedidoService,
    private readonly usuarioService: IUsuarioService,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async listar(): Promise<Pagamento[]> {
    return this.repository.listarPagamentos()
  }

  async buscarPorId(id: number | string): Promise<Pagamento | null> {
    return this.repository.buscarPagamentoPorId(id)
  }

  async editarPorId(id: number | string, dados: {
    pedido_id?: string
    metodo?: string
    status?: string
    valor?: number
  }): Promise<Pagamento> {
    const pagamentoAtual = await this.repository.buscarPagamentoPorId(id)
    if (!pagamentoAtual) {
      throw new PagamentoInvalidoError('Pagamento não encontrado')
    }
    const statusAnterior = pagamentoAtual.status

    if (dados.metodo !== undefined) pagamentoAtual.metodo = dados.metodo
    if (dados.status !== undefined) pagamentoAtual.status = dados.status
    if (dados.valor !== undefined) pagamentoAtual.valorObj = new Dinheiro(Number(dados.valor))
    
    const result = await this.repository.editarPagamentoPorId(id, pagamentoAtual)

    if (statusAnterior !== 'APROVADO' && result.status === 'APROVADO') {
      this.publicarEventoAprovado(result).catch((err) => {
        console.error('Erro ao publicar pagamento.aprovado no editar:', err);
      });
    }

    return result
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarPagamento(id)
  }

  private async publicarEventoAprovado(pagamento: Pagamento): Promise<void> {
    const pedido = await this.pedidoService.buscarPorId(pagamento.pedido_id)
    let nomeUsuario = 'Cliente'
    let emailUsuario: string | null = null

    if (pedido) {
      const usuario = await this.usuarioService.buscarPorId(pedido.usuario_id)
      if (usuario) {
        nomeUsuario = usuario.nome
        emailUsuario = usuario.email
      }
    }

    await this.eventPublisher.publish('pagamento.aprovado', {
      id: pagamento.id,
      pedido_id: pagamento.pedido_id,
      metodo: pagamento.metodo,
      valor: pagamento.valor,
      status: pagamento.status,
      usuario_nome: nomeUsuario,
      usuario_email: emailUsuario
    })
  }
}
