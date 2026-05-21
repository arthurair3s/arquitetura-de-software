import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js'
import type { RoteamentoAppService } from '../application/roteamentoService.js'

export const createRoteamentoQuery = (service: RoteamentoAppService) => ({
  calcularResumoRota: async (_: any, { origemLat, origemLon, destinoLat, destinoLon }: any) => {
    return service.calcularResumo(new Coordenada(origemLat, origemLon), new Coordenada(destinoLat, destinoLon))
  },
  obterGeometriaRota: async (_: any, { origemLat, origemLon, destinoLat, destinoLon }: any) => {
    return service.obterGeometria(new Coordenada(origemLat, origemLon), new Coordenada(destinoLat, destinoLon))
  },
  calcularRotaMultiplosPontos: async (_: any, { pontos }: any) => {
    return service.calcularMultiplosPontos(pontos.map((p: any) => new Coordenada(p.lat, p.lon)))
  }
})
