import { Entrega } from '../../domain/Entrega.js'

export interface IEntregaService {
  listar(): Promise<Entrega[]>
  buscarPorId(id: number | string): Promise<Entrega | null>
  criar(dados: {
    pedido_id: number | string
    entregador_id: number | string
    status?: string
    previsao_entrega?: string | Date
  }): Promise<Entrega>
  editarPorId(id: number | string, dados: {
    pedido_id?: number | string
    entregador_id?: number | string
    status?: string
    previsao_entrega?: string | Date
  }): Promise<Entrega>
  deletar(id: number | string): Promise<boolean>
  buscarPorPedidoId(id: number | string): Promise<Entrega[]>
  buscarPorEntregadorId(id: number | string): Promise<Entrega[]>
}
