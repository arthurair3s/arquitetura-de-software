import { prisma } from '../infra/database/connection.js'
import { Avaliacao } from './domain/Avaliacao.js'

export const listarAvaliacoes = async (): Promise<Avaliacao[]> => {
  const avaliacoes = await prisma.avaliacoes.findMany()
  return avaliacoes.map((a) => Avaliacao.criar(a))
}

export const buscarAvaliacaoPorId = async (id: number | string): Promise<Avaliacao | null> => {
  const avaliacao = await prisma.avaliacoes.findUnique({
    where: { id: Number(id) }
  })
  if (!avaliacao) return null
  return Avaliacao.criar(avaliacao)
}

export const criarAvaliacao = async (avaliacao: Avaliacao): Promise<Avaliacao> => {
  const novaAvaliacao = await prisma.avaliacoes.create({
    data: {
      usuario_id: avaliacao.usuario_id != null ? Number(avaliacao.usuario_id) : undefined,
      restaurante_id: avaliacao.restaurante_id != null ? Number(avaliacao.restaurante_id) : undefined,
      nota: Number(avaliacao.nota),
      comentario: avaliacao.comentario
    }
  })
  return Avaliacao.criar(novaAvaliacao)
}

export const editarAvaliacaoPorId = async (id: number | string, avaliacao: Partial<Avaliacao>): Promise<Avaliacao> => {
  const avaliacaoAtualizada = await prisma.avaliacoes.update({
    where: { id: Number(id) },
    data: {
      usuario_id: avaliacao.usuario_id != null ? Number(avaliacao.usuario_id) : undefined,
      restaurante_id: avaliacao.restaurante_id != null ? Number(avaliacao.restaurante_id) : undefined,
      nota: avaliacao.nota != null ? Number(avaliacao.nota) : undefined,
      comentario: avaliacao.comentario !== undefined ? avaliacao.comentario : undefined
    }
  })
  return Avaliacao.criar(avaliacaoAtualizada)
}

export const deletarAvaliacao = async (id: number | string): Promise<boolean> => {
  await prisma.avaliacoes.delete({
    where: { id: Number(id) }
  })
  return true
}
