import type { IAvaliacaoRepository } from '../../domain/ports/IAvaliacaoRepository.js'
import type { IAvaliacaoService } from '../ports/IAvaliacaoService.js'
import { Avaliacao, AvaliacaoInvalidaError } from '../../domain/Avaliacao.js'

export class AvaliacaoAppService implements IAvaliacaoService {
  constructor(private readonly repository: IAvaliacaoRepository) {}

  async listar(): Promise<Avaliacao[]> {
    return this.repository.listarAvaliacoes()
  }

  async buscarPorId(id: number | string): Promise<Avaliacao | null> {
    return this.repository.buscarAvaliacaoPorId(id)
  }

  async criar(dados: {
    usuario_id: string
    restaurante_id: string
    nota: number
    comentario?: string
  }): Promise<Avaliacao> {
    const avaliacao = new Avaliacao(
      dados.nota,
      Number(dados.usuario_id),
      Number(dados.restaurante_id),
      dados.comentario
    )
    return this.repository.criarAvaliacao(avaliacao)
  }

  async editarPorId(id: number | string, dados: {
    nota?: number
    comentario?: string
  }): Promise<Avaliacao> {
    const avaliacaoAtual = await this.repository.buscarAvaliacaoPorId(id)
    if (!avaliacaoAtual) {
      throw new AvaliacaoInvalidaError('Avaliação não encontrada')
    }
    if (dados.nota !== undefined) avaliacaoAtual.nota = Number(dados.nota)
    if (dados.comentario !== undefined) avaliacaoAtual.comentario = dados.comentario
    return this.repository.editarAvaliacaoPorId(id, avaliacaoAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarAvaliacao(id)
  }
}
