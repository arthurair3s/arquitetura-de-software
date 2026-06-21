import type { IRoteamentoProvider, ResumoRota, GeometriaRota, PontoRota } from '../../domain/ports/IRoteamentoProvider.js'
import type { IRoteamentoService } from '../ports/IRoteamentoService.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js';

export class RoteamentoAppService implements IRoteamentoService {
  constructor(private readonly provider: IRoteamentoProvider) {}

  // TODO: Migrar para CalcularResumoRotaUseCase
  async calcularResumo(origem: Coordenada, destino: Coordenada): Promise<ResumoRota> {
    return this.provider.calcularResumo(origem, destino)
  }

  // TODO: Migrar para ObterGeometriaRotaUseCase
  async obterGeometria(origem: Coordenada, destino: Coordenada): Promise<GeometriaRota> {
    return this.provider.obterGeometria(origem, destino)
  }

  // TODO: Migrar para CalcularMultiplosPontosRotaUseCase
  async calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota> {
    return this.provider.calcularMultiplosPontos(pontos)
  }

  // TODO: Migrar para EncaixarNaEstradaUseCase
  async encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota> {
    return this.provider.encaixarNaEstrada(latitude, longitude)
  }
}
