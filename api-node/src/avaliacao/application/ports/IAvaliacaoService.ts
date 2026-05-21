import { Avaliacao } from '../../domain/Avaliacao.js'

export interface IAvaliacaoService {
  listar(): Promise<Avaliacao[]>
  buscarPorId(id: number | string): Promise<Avaliacao | null>
  criar(dados: {
    usuario_id: string
    restaurante_id: string
    nota: number
    comentario?: string
  }): Promise<Avaliacao>
  editarPorId(id: number | string, dados: {
    nota?: number
    comentario?: string
  }): Promise<Avaliacao>
  deletar(id: number | string): Promise<boolean>
}
