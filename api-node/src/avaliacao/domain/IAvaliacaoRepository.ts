import { Avaliacao } from './Avaliacao.js'

export interface IAvaliacaoRepository {
  listarAvaliacoes(): Promise<Avaliacao[]>
  buscarAvaliacaoPorId(id: number | string): Promise<Avaliacao | null>
  criarAvaliacao(avaliacao: Avaliacao): Promise<Avaliacao>
  editarAvaliacaoPorId(id: number | string, avaliacao: Partial<Avaliacao>): Promise<Avaliacao>
  deletarAvaliacao(id: number | string): Promise<boolean>
}
