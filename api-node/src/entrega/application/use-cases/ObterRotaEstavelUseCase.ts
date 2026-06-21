import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { IEntregadorService } from '../../../entregador/application/ports/IEntregadorService.js'
import type { IRestauranteService } from '../../../restaurante/application/ports/IRestauranteService.js'
import type { IRoteamentoService } from '../../../roteamento/application/ports/IRoteamentoService.js'
import { logger } from '../../../shared/utils/logger.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'

export class ObterRotaEstavelUseCase {
  private routeCache = new Map<string, any>()

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
    const cacheKey = `${entregaId}_${currentStatus}`

    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey)
    }

    for (const key of this.routeCache.keys()) {
      if (key.startsWith(`${entregaId}_`)) this.routeCache.delete(key)
    }

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id)
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id)

    if (!pedido || !motorista || !motorista.coordenada) return null

    let destinoCoordenada: Coordenada = pedido.destino

    if (currentStatus === 'ATRIBUIDA') {
      const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id)
      if (restaurante && restaurante.coordenada) {
        destinoCoordenada = restaurante.coordenada
      }
    }

    try {
      const rota = await this.roteamentoService.obterGeometria(
        motorista.coordenada,
        destinoCoordenada
      )
      if (rota && rota.caminho && rota.caminho.length > 0) {
        this.routeCache.set(cacheKey, rota)
      }
      return rota
    } catch (err: any) {
      logger.error(`Erro crítico ao calcular cache rota: ${err.message}`, 'Cache Rota')
      return null
    }
  }
}
