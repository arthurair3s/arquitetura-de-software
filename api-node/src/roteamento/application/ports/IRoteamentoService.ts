import type { ResumoRota, GeometriaRota, PontoRota } from '../../domain/ports/IRoteamentoProvider.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'

export interface IRoteamentoService {
  calcularResumo(origem: Coordenada, destino: Coordenada): Promise<ResumoRota>
  obterGeometria(origem: Coordenada, destino: Coordenada): Promise<GeometriaRota>
  calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota>
  encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota>
}
