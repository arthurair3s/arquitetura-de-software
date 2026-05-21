import * as roteamentoService from '../roteamentoService.js'

export const Query = {
  calcularResumoRota: async (_: any, { origemLat, origemLon, destinoLat, destinoLon }: any) => {
    return roteamentoService.calcularResumo(origemLat, origemLon, destinoLat, destinoLon)
  },
  obterGeometriaRota: async (_: any, { origemLat, origemLon, destinoLat, destinoLon }: any) => {
    return roteamentoService.obterGeometria(origemLat, origemLon, destinoLat, destinoLon)
  },
  calcularRotaMultiplosPontos: async (_: any, { pontos }: any) => {
    return roteamentoService.calcularMultiplosPontos(pontos)
  }
}
