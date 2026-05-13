import { prisma } from '../infra/database/connection.js'
import { Pedido } from './domain/Pedido.js'

export const listarPedidos = async (): Promise<Pedido[]> => {
  const pedidos = await prisma.pedidos.findMany()
  return pedidos.map((p) => Pedido.criar(p))
}

export const buscarPedidoPorId = async (id: number | string): Promise<Pedido | null> => {
  const pedido = await prisma.pedidos.findUnique({
    where: { id: Number(id) }
  })
  if (!pedido) return null
  return Pedido.criar(pedido)
}

export const buscarPedidoPorUsuarioId = async (usuario_id: number | string): Promise<Pedido[]> => {
  const pedidos = await prisma.pedidos.findMany({
    where: { usuario_id: Number(usuario_id) }
  })
  return pedidos.map((p) => Pedido.criar(p))
}

export const criarPedido = async (pedido: Pedido): Promise<Pedido> => {
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

export const editarPedidoPorId = async (id: number | string, pedido: Partial<Pedido>): Promise<Pedido> => {
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

export const deletarPedido = async (id: number | string): Promise<boolean> => {
  await prisma.pedidos.delete({
    where: { id: Number(id) }
  })
  return true
}
