import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { IEntregadorService } from '../../../entregador/application/ports/IEntregadorService.js'
import type { IRestauranteService } from '../../../restaurante/application/ports/IRestauranteService.js'
import type { IRoteamentoService } from '../../../roteamento/application/ports/IRoteamentoService.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'

export class ObterRotaEntregaUseCase {
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

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id)
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id)
    if (!pedido || !motorista || !motorista.coordenada) return null

    const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id)
    if (!restaurante) return null

    const currentStatus = (entrega.status || '').trim().toUpperCase()

    let startCoordenada: Coordenada | null = restaurante.coordenada

    if (currentStatus === 'EM_TRANSITO') {
      startCoordenada = motorista.coordenada
    }

    if (!startCoordenada) return null

    try {
      return await this.roteamentoService.obterGeometria(
        startCoordenada,
        pedido.destino
      )
    } catch (err) {
      return null
    }
  }
}
