import { prisma } from '../../infra/database/connection.js'
import { Pedido } from '../domain/Pedido.js'
import type { IPedidoRepository } from '../domain/IPedidoRepository.js'

export class PedidoRepository implements IPedidoRepository {
  async listarPedidos(): Promise<Pedido[]> {
    const pedidos = await prisma.pedidos.findMany()
    return pedidos.map((p) => Pedido.criar(p))
  }

  async buscarPedidoPorId(id: number | string): Promise<Pedido | null> {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: Number(id) }
    })
    if (!pedido) return null
    return Pedido.criar(pedido)
  }

  async buscarPedidoPorUsuarioId(usuario_id: number | string): Promise<Pedido[]> {
    const pedidos = await prisma.pedidos.findMany({
      where: { usuario_id: Number(usuario_id) }
    })
    return pedidos.map((p) => Pedido.criar(p))
  }

  async criarPedido(pedido: Pedido): Promise<Pedido> {
    const novoPedido = await prisma.pedidos.create({
      data: {
        usuario_id: pedido.usuario_id != null ? Number(pedido.usuario_id) : undefined,
        restaurante_id: pedido.restaurante_id != null ? Number(pedido.restaurante_id) : undefined,
        status: pedido.status,
        valor_total: pedido.valor_total,
        destino_latitude: pedido.destino_latitude,
        destino_longitude: pedido.destino_longitude
      }
    })
    return Pedido.criar(novoPedido)
  }

  async editarPedidoPorId(id: number | string, pedido: Partial<Pedido>): Promise<Pedido> {
    const pedidoAtualizado = await prisma.pedidos.update({
      where: { id: Number(id) },
      data: {
        status: pedido.status,
        valor_total: pedido.valor_total != null ? Number(pedido.valor_total) : undefined,
        destino_latitude: pedido.destino_latitude != null ? Number(pedido.destino_latitude) : undefined,
        destino_longitude: pedido.destino_longitude != null ? Number(pedido.destino_longitude) : undefined
      }
    })
    return Pedido.criar(pedidoAtualizado)
  }

  async deletarPedido(id: number | string): Promise<boolean> {
    await prisma.pedidos.delete({
      where: { id: Number(id) }
    })
    return true
  }
}
