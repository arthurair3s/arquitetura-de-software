import type { EntregaAppService } from './entregaService.js'
import type { PedidoAppService } from '../../pedido/application/pedidoService.js'
import type { EntregadorAppService } from '../../entregador/application/entregadorService.js'
import type { RestauranteAppService } from '../../restaurante/application/restauranteService.js'
import type { RoteamentoAppService } from '../../roteamento/application/roteamentoService.js'
import { logger } from '../../shared/utils/logger.js'

export class RotaEntregaService {
  private routeCache = new Map<string, any>();

  constructor(
    private readonly entregaService: EntregaAppService,
    private readonly pedidoService: PedidoAppService,
    private readonly entregadorService: EntregadorAppService,
    private readonly restauranteService: RestauranteAppService,
    private readonly roteamentoService: RoteamentoAppService
  ) {}

  async obterRotaEstavel(entregaId: number | string): Promise<any> {
    const entrega = await this.entregaService.buscarPorId(entregaId);
    if (!entrega) return null;

    const currentStatus = (entrega.status || "").trim().toUpperCase();
    const cacheKey = `${entregaId}_${currentStatus}`;

    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey);
    }

    for (const key of this.routeCache.keys()) {
      if (key.startsWith(`${entregaId}_`)) this.routeCache.delete(key);
    }

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id);
    
    if (!pedido || !motorista) return null;

    let destLat: number | null = pedido.destino_latitude ?? null;
    let destLon: number | null = pedido.destino_longitude ?? null;

    if (currentStatus === 'ATRIBUIDA') {
      const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id);
      if (restaurante) {
        destLat = restaurante.latitude;
        destLon = restaurante.longitude;
      }
    }

    if (destLat == null || destLon == null) return null;

    try {
      const rota = await this.roteamentoService.obterGeometria(
        Number(motorista.latitude), 
        Number(motorista.longitude), 
        Number(destLat), 
        Number(destLon)
      );
      if (rota && rota.caminho && rota.caminho.length > 0) {
        this.routeCache.set(cacheKey, rota);
      }
      return rota;
    } catch (err: any) {
      logger.error(`Erro crítico ao calcular cache rota: ${err.message}`, 'Cache Rota');
      return null;
    }
  }

  async obterRotaColeta(entregaId: number | string): Promise<any> {
    const entrega = await this.entregaService.buscarPorId(entregaId);
    if (!entrega) return null;

    const currentStatus = (entrega.status || "").trim().toUpperCase();
    if (currentStatus !== 'ATRIBUIDA') return null;

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id);
    if (!pedido || !motorista) return null;

    const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id);
    if (!restaurante || restaurante.latitude == null || restaurante.longitude == null) return null;

    try {
      return await this.roteamentoService.obterGeometria(
        Number(motorista.latitude), 
        Number(motorista.longitude), 
        Number(restaurante.latitude), 
        Number(restaurante.longitude)
      );
    } catch (err) {
      return null;
    }
  }

  async obterRotaEntrega(entregaId: number | string): Promise<any> {
    const entrega = await this.entregaService.buscarPorId(entregaId);
    if (!entrega) return null;

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id);
    if (!pedido || !motorista) return null;

    const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id);
    if (!restaurante) return null;

    const currentStatus = (entrega.status || "").trim().toUpperCase();

    let startLat = restaurante.latitude;
    let startLon = restaurante.longitude;

    if (currentStatus === 'EM_TRANSITO') {
      startLat = motorista.latitude;
      startLon = motorista.longitude;
    }

    if (startLat == null || startLon == null || pedido.destino_latitude == null || pedido.destino_longitude == null) return null;

    try {
      return await this.roteamentoService.obterGeometria(
        Number(startLat), 
        Number(startLon), 
        Number(pedido.destino_latitude), 
        Number(pedido.destino_longitude)
      );
    } catch (err) {
      return null;
    }
  }
}
