import { Entregador } from '../../domain/Entregador.js'

export interface IEntregadorService {
  bloquearParaSimulacao(id: number | string): void
  liberarDeSimulacao(id: number | string): void
  estaEmSimulacao(id: number | string): boolean
  criar(dados: { nome?: string; telefone?: string | null; veiculo?: string | null }): Promise<Entregador>
  listarProximos(latitude: number, longitude: number, raioKm: number): Promise<Entregador[]>
  listarProximosAoRestaurante(restauranteId: number | string, raioKm: number): Promise<Entregador[]>
  buscarPorId(id: number | string): Promise<Entregador | null>
  editarPorId(id: number | string, dados: { nome?: string; telefone?: string | null; veiculo?: string | null }): Promise<Entregador>
  deletar(id: number | string): Promise<boolean>
  listar(): Promise<Entregador[]>
  atualizarStatus(id: number | string, novoStatus: string): Promise<Entregador>
  atualizarLocalizacao(id: number | string, latitude: number, longitude: number): Promise<boolean>
  finalizarStreamLocalizacao(id: number | string): void
  povoarFrota(): Promise<boolean>
}
