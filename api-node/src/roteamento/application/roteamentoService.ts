import type { IRoteamentoProvider, ResumoRota, GeometriaRota, PontoRota } from '../domain/IRoteamentoProvider.js'

export class RoteamentoAppService {
  constructor(private readonly provider: IRoteamentoProvider) {}

  async calcularResumo(origemLat: number, origemLon: number, destinoLat: number, destinoLon: number): Promise<ResumoRota> {
    return this.provider.calcularResumo(origemLat, origemLon, destinoLat, destinoLon)
  }

  async obterGeometria(origemLat: number, origemLon: number, destinoLat: number, destinoLon: number): Promise<GeometriaRota> {
    return this.provider.obterGeometria(origemLat, origemLon, destinoLat, destinoLon)
  }

  async calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota> {
    return this.provider.calcularMultiplosPontos(pontos)
  }

  async encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota> {
    return this.provider.encaixarNaEstrada(latitude, longitude)
  }
}
