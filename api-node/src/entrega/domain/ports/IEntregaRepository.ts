import { Entrega } from '../Entrega.js'

export interface IEntregaRepository {
  listarEntregas(): Promise<Entrega[]>
  buscarEntregaPorId(id: number | string): Promise<Entrega | null>
  criarEntrega(entrega: Entrega): Promise<Entrega>
  editarEntregaPorId(id: number | string, entrega: Partial<Entrega>): Promise<Entrega>
  deletarEntrega(id: number | string): Promise<boolean>
  buscarEntregaPorPedidoId(pedido_id: number | string): Promise<Entrega[]>
  buscarEntregaPorEntregadorId(entregador_id: number | string): Promise<Entrega[]>
}
