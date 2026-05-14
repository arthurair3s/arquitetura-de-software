import { prisma } from '../../infra/database/connection.js'
import { Avaliacao } from '../domain/Avaliacao.js'
import type { IAvaliacaoRepository } from '../domain/IAvaliacaoRepository.js'

export class AvaliacaoRepository implements IAvaliacaoRepository {
  async listarAvaliacoes(): Promise<Avaliacao[]> {
    const avaliacoes = await prisma.avaliacoes.findMany()
    return avaliacoes.map((a) => Avaliacao.criar(a))
  }

  async buscarAvaliacaoPorId(id: number | string): Promise<Avaliacao | null> {
    const avaliacao = await prisma.avaliacoes.findUnique({
      where: { id: Number(id) }
    })
    if (!avaliacao) return null
    return Avaliacao.criar(avaliacao)
  }

  async criarAvaliacao(avaliacao: Avaliacao): Promise<Avaliacao> {
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

  async editarAvaliacaoPorId(id: number | string, avaliacao: Partial<Avaliacao>): Promise<Avaliacao> {
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

  async deletarAvaliacao(id: number | string): Promise<boolean> {
    await prisma.avaliacoes.delete({
      where: { id: Number(id) }
    })
    return true
  }
}
