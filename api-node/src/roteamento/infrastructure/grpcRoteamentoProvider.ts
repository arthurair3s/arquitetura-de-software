import roteamentoClient from '../../grpc/roteamentoClient.js'
import type { IRoteamentoProvider, ResumoRota, GeometriaRota, PontoRota } from '../domain/IRoteamentoProvider.js'

export class GrpcRoteamentoProvider implements IRoteamentoProvider {
  calcularResumo(origemLat: number, origemLon: number, destinoLat: number, destinoLon: number): Promise<ResumoRota> {
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

  obterGeometria(origemLat: number, origemLon: number, destinoLat: number, destinoLon: number): Promise<GeometriaRota> {
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

  calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota> {
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

  encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota> {
    return new Promise((resolve, reject) => {
      roteamentoClient.EncaixarNaEstrada(
        { latitude, longitude },
        (error, response) => {
          if (error || !response) return resolve({ latitude, longitude }) // retorno das coordenadas originais em caso de erro
          resolve(response as PontoRota)
        }
      )
    })
  }
}
