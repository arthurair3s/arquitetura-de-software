import type { IPagamentoRepository } from '../../domain/ports/IPagamentoRepository.js'
import type { IPagamentoService } from '../ports/IPagamentoService.js'
import { Pagamento, PagamentoInvalidoError } from '../../domain/Pagamento.js'
import { Dinheiro } from '../../../shared/domain/value-objects/Dinheiro.js'
import { StatusPagamento } from '../../domain/StatusPagamento.js'
import { rabbitMQPublisher } from '../../../shared/infrastructure/messaging/rabbitmqPublisher.js'

export class PagamentoAppService implements IPagamentoService {
  constructor(private readonly repository: IPagamentoRepository) {}

  async listar(): Promise<Pagamento[]> {
    return this.repository.listarPagamentos()
  }

  async buscarPorId(id: number | string): Promise<Pagamento | null> {
    return this.repository.buscarPagamentoPorId(id)
  }

  async criar(dados: {
    pedido_id: string
    metodo?: string
    status?: string
    valor?: number
  }): Promise<Pagamento> {
    const status = new StatusPagamento(dados.status || 'PENDENTE');
    const pagamento = new Pagamento(
      Number(dados.pedido_id),
      dados.metodo || '',
      new Dinheiro(Number(dados.valor || 0)),
      status
    )
    const result = await this.repository.criarPagamento(pagamento)

    if (result.status === 'APROVADO') {
      rabbitMQPublisher.publish('pagamento.aprovado', {
        id: result.id,
        pedido_id: result.pedido_id,
        metodo: result.metodo,
        valor: result.valor,
        status: result.status
      }).catch((err) => {
        console.error('Erro ao publicar pagamento.aprovado no criar:', err);
      });
    }

    return result
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
      rabbitMQPublisher.publish('pagamento.aprovado', {
        id: result.id,
        pedido_id: result.pedido_id,
        metodo: result.metodo,
        valor: result.valor,
        status: result.status
      }).catch((err) => {
        console.error('Erro ao publicar pagamento.aprovado no editar:', err);
      });
    }

    return result
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarPagamento(id)
  }
}
