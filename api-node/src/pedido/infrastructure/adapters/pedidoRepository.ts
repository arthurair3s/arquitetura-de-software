import { prisma } from '../../../infra/database/connection.js'
import { Pedido } from '../../domain/Pedido.js'
import type { IPedidoRepository } from '../../domain/ports/IPedidoRepository.js'

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

  async buscarPedidoPorRestauranteId(restaurante_id: number | string): Promise<Pedido[]> {
    const pedidos = await prisma.pedidos.findMany({
      where: { restaurante_id: Number(restaurante_id) }
    })
    return pedidos.map((p) => Pedido.criar(p))
  }

  async criarPedido(pedido: Pedido): Promise<Pedido> {
    const novoPedido = await prisma.pedidos.create({
      data: {
        usuario_id: pedido.usuario_id != null ? Number(pedido.usuario_id) : undefined,
        restaurante_id: pedido.restaurante_id != null ? Number(pedido.restaurante_id) : undefined,
        status: pedido.status,
        valor_total: pedido.valor?.valor,
        destino_latitude: pedido.destino?.latitude,
        destino_longitude: pedido.destino?.longitude
      }
    })
    return Pedido.criar(novoPedido)
  }

  async editarPedidoPorId(id: number | string, pedido: Partial<Pedido>): Promise<Pedido> {
    const pedidoAtualizado = await prisma.pedidos.update({
      where: { id: Number(id) },
      data: {
        status: pedido.status,
        valor_total: pedido.valor?.valor != null ? Number(pedido.valor.valor) : undefined,
        destino_latitude: pedido.destino?.latitude != null ? Number(pedido.destino.latitude) : undefined,
        destino_longitude: pedido.destino?.longitude != null ? Number(pedido.destino.longitude) : undefined
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
