import { prisma } from '../../../infra/database/connection.js'
import { ItemPedido } from '../../domain/ItemPedido.js'
import type { IItemPedidoRepository } from '../../domain/ports/IItemPedidoRepository.js'

export class ItemPedidoRepository implements IItemPedidoRepository {
  async listarItensPedido(): Promise<ItemPedido[]> {
    const itens = await prisma.itens_pedido.findMany()
    return itens.map((item) => ItemPedido.criar(item))
  }

  async buscarItemPedidoPorId(id: number | string): Promise<ItemPedido | null> {
    const item = await prisma.itens_pedido.findUnique({
      where: { id: Number(id) }
    })
    if (!item) return null
    return ItemPedido.criar(item)
  }

  async buscarItensPorPedidoId(pedido_id: number | string): Promise<ItemPedido[]> {
    const itens = await prisma.itens_pedido.findMany({
      where: { pedido_id: Number(pedido_id) }
    })
    return itens.map((item) => ItemPedido.criar(item))
  }

  async criarItemPedido(item: ItemPedido): Promise<ItemPedido> {
    const novoItem = await prisma.itens_pedido.create({
      data: {
        pedido_id: item.pedido_id != null ? Number(item.pedido_id) : undefined,
        produto_id: item.produto_id != null ? Number(item.produto_id) : undefined,
        quantidade: Number(item.quantidade),
        preco_unitario: item.preco_unitario != null ? Number(item.preco_unitario) : undefined
      }
    })
    return ItemPedido.criar(novoItem)
  }

  async editarItemPedidoPorId(id: number | string, item: Partial<ItemPedido>): Promise<ItemPedido> {
    const itemAtualizado = await prisma.itens_pedido.update({
      where: { id: Number(id) },
      data: {
        pedido_id: item.pedido_id != null ? Number(item.pedido_id) : undefined,
        produto_id: item.produto_id != null ? Number(item.produto_id) : undefined,
        quantidade: item.quantidade != null ? Number(item.quantidade) : undefined,
        preco_unitario: item.preco_unitario != null ? Number(item.preco_unitario) : undefined
      }
    })
    return ItemPedido.criar(itemAtualizado)
  }

  async deletarItemPedido(id: number | string): Promise<boolean> {
    await prisma.itens_pedido.delete({
      where: { id: Number(id) }
    })
    return true
  }
}
