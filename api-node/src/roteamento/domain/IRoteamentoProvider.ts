import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';

export interface PontoRota {
  latitude: number;
  longitude: number;
}

export interface ResumoRota {
  distancia_km: number;
  duracao_estimada_segundos: number;
  mensagem_erro?: string;
}

export interface GeometriaRota {
  caminho: PontoRota[];
  distancia_total_km: number;
  duracao_total_segundos: number;
}

export interface IRoteamentoProvider {
  calcularResumo(origem: Coordenada, destino: Coordenada): Promise<ResumoRota>
  obterGeometria(origem: Coordenada, destino: Coordenada): Promise<GeometriaRota>
  calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota>
  encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota>
}
