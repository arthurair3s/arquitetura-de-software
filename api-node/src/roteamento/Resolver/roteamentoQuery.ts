import type { RoteamentoAppService } from '../application/roteamentoService.js'

export const createRoteamentoQuery = (service: RoteamentoAppService) => ({
  calcularResumoRota: async (_: any, { origemLat, origemLon, destinoLat, destinoLon }: any) => {
    return service.calcularResumo(origemLat, origemLon, destinoLat, destinoLon)
  },
  obterGeometriaRota: async (_: any, { origemLat, origemLon, destinoLat, destinoLon }: any) => {
    return service.obterGeometria(origemLat, origemLon, destinoLat, destinoLon)
  },
  calcularRotaMultiplosPontos: async (_: any, { pontos }: any) => {
    return service.calcularMultiplosPontos(pontos)
  }
})
