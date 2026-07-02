import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { IEntregadorService } from '../../../entregador/application/ports/IEntregadorService.js'
import type { IRestauranteService } from '../../../restaurante/application/ports/IRestauranteService.js'
import type { IRoteamentoService } from '../../../roteamento/application/ports/IRoteamentoService.js'

export class ObterRotaColetaUseCase {
  constructor(
    private readonly repository: IEntregaRepository,
    private readonly pedidoService: IPedidoService,
    private readonly entregadorService: IEntregadorService,
    private readonly restauranteService: IRestauranteService,
    private readonly roteamentoService: IRoteamentoService
  ) {}

  async execute(entregaId: number | string): Promise<any> {
    const entrega = await this.repository.buscarEntregaPorId(entregaId)
    if (!entrega) return null

    const currentStatus = (entrega.status || '').trim().toUpperCase()
    if (currentStatus !== 'ATRIBUIDA') return null

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id)
    if (entrega.entregador_id == null) return null
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id)
    if (!pedido || !motorista || !motorista.coordenada) return null

    const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id)
    if (!restaurante || !restaurante.coordenada) return null

    try {
      return await this.roteamentoService.obterGeometria(
        motorista.coordenada,
        restaurante.coordenada
      )
    } catch (err) {
      return null
    }
  }
}
