import type { IRoteamentoProvider, ResumoRota, GeometriaRota, PontoRota } from '../domain/IRoteamentoProvider.js'
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';

export class RoteamentoAppService {
  constructor(private readonly provider: IRoteamentoProvider) {}

  async calcularResumo(origem: Coordenada, destino: Coordenada): Promise<ResumoRota> {
    return this.provider.calcularResumo(origem, destino)
  }

  async obterGeometria(origem: Coordenada, destino: Coordenada): Promise<GeometriaRota> {
    return this.provider.obterGeometria(origem, destino)
  }

  async calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota> {
    return this.provider.calcularMultiplosPontos(pontos)
  }

  async encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota> {
    return this.provider.encaixarNaEstrada(latitude, longitude)
  }
}
