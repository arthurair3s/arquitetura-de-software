import { prisma } from '../../infra/database/connection.js'
import { Entrega } from '../domain/Entrega.js'
import type { IEntregaRepository } from '../domain/IEntregaRepository.js'

export class EntregaRepository implements IEntregaRepository {
  async listarEntregas(): Promise<Entrega[]> {
    const entregas = await prisma.entregas.findMany()
    return entregas.map((e) => Entrega.criar(e))
  }

  async buscarEntregaPorId(id: number | string): Promise<Entrega | null> {
    const entrega = await prisma.entregas.findUnique({
      where: { id: Number(id) }
    })
    if (!entrega) return null
    return Entrega.criar(entrega)
  }

  async criarEntrega(entrega: Entrega): Promise<Entrega> {
    const novaEntrega = await prisma.entregas.create({
      data: {
        pedido_id: entrega.pedido_id != null ? Number(entrega.pedido_id) : undefined,
        entregador_id: entrega.entregador_id != null ? Number(entrega.entregador_id) : undefined,
        status: entrega.status,
        previsao_entrega: entrega.previsao_entrega
      }
    })
    return Entrega.criar(novaEntrega)
  }

  async editarEntregaPorId(id: number | string, entrega: Partial<Entrega>): Promise<Entrega> {
    const entregaAtualizada = await prisma.entregas.update({
      where: { id: Number(id) },
      data: {
        status: entrega.status,
        previsao_entrega: entrega.previsao_entrega,
        pedido_id: entrega.pedido_id != null ? Number(entrega.pedido_id) : undefined,
        entregador_id: entrega.entregador_id != null ? Number(entrega.entregador_id) : undefined
      }
    })
    return Entrega.criar(entregaAtualizada)
  }

  async deletarEntrega(id: number | string): Promise<boolean> {
    await prisma.entregas.delete({
      where: { id: Number(id) }
    })
    return true
  }

  async buscarEntregaPorPedidoId(pedido_id: number | string): Promise<Entrega[]> {
    const entregas = await prisma.entregas.findMany({
      where: { pedido_id: Number(pedido_id) }
    })
    return entregas.map((e) => Entrega.criar(e))
  }

  async buscarEntregaPorEntregadorId(entregador_id: number | string): Promise<Entrega[]> {
    const entregas = await prisma.entregas.findMany({
      where: { entregador_id: Number(entregador_id) }
    })
    return entregas.map((e) => Entrega.criar(e))
  }
}
