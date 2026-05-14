import * as itemPedidoRepository from './itemPedidoRepository.js'
import { ItemPedido, ItemPedidoInvalidoError } from './domain/ItemPedido.js'

export const listar = async (): Promise<ItemPedido[]> => {
  return itemPedidoRepository.listarItensPedido()
}

export const buscarPorId = async (id: number | string): Promise<ItemPedido | null> => {
  return itemPedidoRepository.buscarItemPedidoPorId(id)
}

export const buscarItensPorPedidoId = async (pedido_id: number | string): Promise<ItemPedido[]> => {
  return itemPedidoRepository.buscarItensPorPedidoId(pedido_id)
}

export const criar = async (dados: { 
  pedido_id: string | number; 
  produto_id: string | number; 
  quantidade: number; 
  preco_unitario: number 
}): Promise<ItemPedido> => {
  const item = new ItemPedido(
    Number(dados.pedido_id),
    Number(dados.produto_id),
    Number(dados.quantidade),
    Number(dados.preco_unitario)
  );
  return itemPedidoRepository.criarItemPedido(item)
}

export const editarPorId = async (id: number | string, dados: { 
  pedido_id?: string | number; 
  produto_id?: string | number; 
  quantidade?: number; 
  preco_unitario?: number 
}): Promise<ItemPedido> => {
  const itemAtual = await itemPedidoRepository.buscarItemPedidoPorId(id);
  if (!itemAtual) {
    throw new ItemPedidoInvalidoError('Item do Pedido não encontrado');
  }

  if (dados.quantidade !== undefined) itemAtual.quantidade = Number(dados.quantidade);
  if (dados.preco_unitario !== undefined) itemAtual.preco_unitario = Number(dados.preco_unitario);
  
  // campos somente leitura não são atualizados

  return itemPedidoRepository.editarItemPedidoPorId(id, itemAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return itemPedidoRepository.deletarItemPedido(id)
}