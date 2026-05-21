import { Entregador } from '../Entregador.js'

export interface IEntregadorRepository {
  criarEntregador(entregador: Entregador): Promise<Entregador>
  listarProximos(latitude: number, longitude: number, raioKm: number): Promise<Entregador[]>
  buscarEntregadorPorId(id: number | string): Promise<Entregador | null>
  editarEntregadorPorId(id: number | string, entregador: Partial<Entregador>): Promise<Entregador>
  deletarEntregador(id: number | string): Promise<boolean>
  listarEntregadores(): Promise<Entregador[]>
  atualizarStatus(id: number | string, novoStatus: string): Promise<Entregador>
  atualizarLocalizacao(id: number | string, latitude: number, longitude: number): Promise<boolean>
}
