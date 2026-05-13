import { GraphQLError } from 'graphql'
import * as pedidoRepository from './pedidoRepository.js'
import * as usuarioRepository from '../usuario/usuarioRepository.js'
import { Pedido, PedidoInvalidoError } from './domain/Pedido.js'

export const listar = async (): Promise<Pedido[]> => {
  return pedidoRepository.listarPedidos()
}

export const buscarPorId = async (id: number | string): Promise<Pedido | null> => {
  return pedidoRepository.buscarPedidoPorId(id)
}

export const criar = async (dados: {
  usuario_id: string | number;
  restaurante_id: string | number;
  destino_latitude?: number | null;
  destino_longitude?: number | null;
  valor_total: number;
}): Promise<Pedido> => {
  let { destino_latitude, destino_longitude, usuario_id, restaurante_id, valor_total } = dados

  if (destino_latitude == null || destino_longitude == null) {
    const usuario = await usuarioRepository.buscarUsuarioPorId(usuario_id)
    if (!usuario || usuario.latitude == null || usuario.longitude == null) {
      throw new GraphQLError('Endereço de entrega não definido no perfil do usuário.', { extensions: { code: 'BAD_USER_INPUT' } })
    }
    destino_latitude = usuario.latitude
    destino_longitude = usuario.longitude
  }

  const pedido = new Pedido(
    Number(usuario_id),
    Number(restaurante_id),
    'EM_PREPARO_ENTREGA',
    Number(valor_total),
    destino_latitude,
    destino_longitude
  );

  return pedidoRepository.criarPedido(pedido);
}

export const editarPorId = async (id: number | string, dados: {
  status?: string;
  valor_total?: number;
  destino_latitude?: number;
  destino_longitude?: number;
}): Promise<Pedido> => {
  const pedidoAtual = await pedidoRepository.buscarPedidoPorId(id);
  if (!pedidoAtual) {
    throw new PedidoInvalidoError('Pedido não encontrado');
  }

  if (dados.status !== undefined) pedidoAtual.status = dados.status;
  if (dados.valor_total !== undefined) pedidoAtual.valor_total = Number(dados.valor_total);
  if (dados.destino_latitude !== undefined) pedidoAtual.destino_latitude = Number(dados.destino_latitude);
  if (dados.destino_longitude !== undefined) pedidoAtual.destino_longitude = Number(dados.destino_longitude);

  return pedidoRepository.editarPedidoPorId(id, pedidoAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return pedidoRepository.deletarPedido(id)
}

export const buscarPorUsuarioId = async (id: number | string): Promise<Pedido[]> => {
  return pedidoRepository.buscarPedidoPorUsuarioId(id)
}