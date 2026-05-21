import roteamentoClient from '../grpc/roteamentoClient.js'

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

export const calcularResumo = (
  origemLat: number,
  origemLon: number,
  destinoLat: number,
  destinoLon: number
): Promise<ResumoRota> => {
  return new Promise((resolve, reject) => {
    roteamentoClient.CalcularResumoRota(
      {
        origem: { latitude: Number(origemLat), longitude: Number(origemLon) },
        destino: { latitude: Number(destinoLat), longitude: Number(destinoLon) }
      },
      (error, response) => {
        if (error) return reject(error)
        resolve(response as ResumoRota)
      }
    )
  })
}

export const obterGeometria = (
  origemLat: number,
  origemLon: number,
  destinoLat: number,
  destinoLon: number
): Promise<GeometriaRota> => {
  return new Promise((resolve, reject) => {
    roteamentoClient.ObterGeometriaRota(
      {
        origem: { latitude: Number(origemLat), longitude: Number(origemLon) },
        destino: { latitude: Number(destinoLat), longitude: Number(destinoLon) }
      },
      (error, response) => {
        if (error) return reject(error)
        resolve(response as GeometriaRota)
      }
    )
  })
}

export const calcularMultiplosPontos = (pontos: PontoRota[]): Promise<GeometriaRota> => {
  return new Promise((resolve, reject) => {
    roteamentoClient.CalcularRotaMultiplosPontos(
      { pontos: pontos.map(p => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) })) },
      (error, response) => {
        if (error) return reject(error)
        resolve(response as GeometriaRota)
      }
    )
  })
}
