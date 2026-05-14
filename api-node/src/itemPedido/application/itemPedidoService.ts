import type { IItemPedidoRepository } from '../domain/IItemPedidoRepository.js'
import { ItemPedido, ItemPedidoInvalidoError } from '../domain/ItemPedido.js'

export class ItemPedidoAppService {
  constructor(private readonly repository: IItemPedidoRepository) {}

  async listar(): Promise<ItemPedido[]> {
    return this.repository.listarItensPedido()
  }

  async buscarPorId(id: number | string): Promise<ItemPedido | null> {
    return this.repository.buscarItemPedidoPorId(id)
  }

  async buscarItensPorPedidoId(pedido_id: number | string): Promise<ItemPedido[]> {
    return this.repository.buscarItensPorPedidoId(pedido_id)
  }

  async criar(dados: {
    pedido_id: string | number
    produto_id: string | number
    quantidade: number
    preco_unitario: number
  }): Promise<ItemPedido> {
    const item = new ItemPedido(
      Number(dados.pedido_id),
      Number(dados.produto_id),
      Number(dados.quantidade),
      Number(dados.preco_unitario)
    )
    return this.repository.criarItemPedido(item)
  }

  async editarPorId(id: number | string, dados: {
    pedido_id?: string | number
    produto_id?: string | number
    quantidade?: number
    preco_unitario?: number
  }): Promise<ItemPedido> {
    const itemAtual = await this.repository.buscarItemPedidoPorId(id)
    if (!itemAtual) {
      throw new ItemPedidoInvalidoError('Item do Pedido não encontrado')
    }
    if (dados.quantidade !== undefined) itemAtual.quantidade = Number(dados.quantidade)
    if (dados.preco_unitario !== undefined) itemAtual.preco_unitario = Number(dados.preco_unitario)
    return this.repository.editarItemPedidoPorId(id, itemAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarItemPedido(id)
  }
}
