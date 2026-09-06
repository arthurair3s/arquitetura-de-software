import { Pedido } from '../../domain/Pedido.js'

export interface IPedidoService {
  listar(): Promise<Pedido[]>
  buscarPorId(id: number | string): Promise<Pedido | null>
  buscarPorUsuarioId(id: number | string): Promise<Pedido[]>
  buscarPorRestauranteId(id: number | string): Promise<Pedido[]>
  editarPorId(id: number | string, dados: {
    status?: string
    valor_total?: number
    destino_latitude?: number
    destino_longitude?: number
  }): Promise<Pedido>
  deletar(id: number | string): Promise<boolean>
}
