import type { IPagamentoRepository } from '../../domain/ports/IPagamentoRepository.js'
import type { IPagamentoService } from '../ports/IPagamentoService.js'
import type { IPagamentoStrategy } from '../ports/IPagamentoStrategy.js'
import { Pagamento, PagamentoInvalidoError } from '../../domain/Pagamento.js'
import { Dinheiro } from '../../../shared/domain/value-objects/Dinheiro.js'
import { StatusPagamento } from '../../domain/StatusPagamento.js'
import { rabbitMQPublisher } from '../../../shared/infrastructure/messaging/rabbitmqPublisher.js'
import { PagamentoPixStrategy } from '../../infrastructure/strategies/PagamentoPixStrategy.js'
import { PagamentoCartaoStrategy } from '../../infrastructure/strategies/PagamentoCartaoStrategy.js'
import { PagamentoStripeStrategy } from '../../infrastructure/strategies/PagamentoStripeStrategy.js'
import { prisma } from '../../../infra/database/connection.js'

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
    const metodoNorm = (dados.metodo || 'PIX').toUpperCase()
    let strategy: IPagamentoStrategy

    switch (metodoNorm) {
      case 'PIX':
        strategy = new PagamentoPixStrategy()
        break
      case 'CARTAO':
      case 'CREDITO':
      case 'DEBITO':
        strategy = new PagamentoCartaoStrategy()
        break
      case 'STRIPE':
        strategy = new PagamentoStripeStrategy()
        break
      default:
        strategy = new PagamentoPixStrategy()
    }

    const statusStr = dados.status || 'PENDENTE'
    const statusObj = new StatusPagamento(statusStr)
    const pagamento = new Pagamento(
      Number(dados.pedido_id),
      dados.metodo || 'PIX',
      new Dinheiro(Number(dados.valor || 0)),
      statusObj
    )

    if (statusStr === 'PENDENTE') {
      const res = await strategy.processar(pagamento)
      pagamento.status = res.status
    }

    const result = await this.repository.criarPagamento(pagamento)

    if (result.status === 'APROVADO') {
      this.publicarEventoAprovado(result).catch((err) => {
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
    const pedido = await prisma.pedidos.findUnique({
      where: { id: Number(pagamento.pedido_id) },
      select: {
        id: true,
        usuarios: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    })

    const nomeUsuario = pedido?.usuarios?.nome ?? 'Cliente'
    const emailUsuario = pedido?.usuarios?.email ?? null

    await rabbitMQPublisher.publish('pagamento.aprovado', {
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
