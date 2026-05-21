import { prisma } from '../infra/database/connection.js'
import { Entrega } from './domain/Entrega.js'

export const listarEntregas = async (): Promise<Entrega[]> => {
  const entregas = await prisma.entregas.findMany()
  return entregas.map((e) => Entrega.criar(e))
}

export const buscarEntregaPorId = async (id: number | string): Promise<Entrega | null> => {
  const entrega = await prisma.entregas.findUnique({
    where: { id: Number(id) }
  })
  if (!entrega) return null
  return Entrega.criar(entrega)
}

export const criarEntrega = async (entrega: Entrega): Promise<Entrega> => {
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

export const editarEntregaPorId = async (id: number | string, entrega: Partial<Entrega>): Promise<Entrega> => {
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

export const deletarEntrega = async (id: number | string): Promise<boolean> => {
  await prisma.entregas.delete({
    where: { id: Number(id) }
  })
  return true
}

export const buscarEntregaPorPedidoId = async (pedido_id: number | string): Promise<Entrega[]> => {
  const entregas = await prisma.entregas.findMany({
    where: { pedido_id: Number(pedido_id) }
  })
  return entregas.map((e) => Entrega.criar(e))
}

export const buscarEntregaPorEntregadorId = async (entregador_id: number | string): Promise<Entrega[]> => {
  const entregas = await prisma.entregas.findMany({
    where: { entregador_id: Number(entregador_id) }
  })
  return entregas.map((e) => Entrega.criar(e))
}
