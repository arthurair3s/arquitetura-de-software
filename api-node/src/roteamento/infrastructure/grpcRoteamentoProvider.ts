import roteamentoClient from '../../grpc/roteamentoClient.js'
import type { IRoteamentoProvider, ResumoRota, GeometriaRota, PontoRota } from '../domain/IRoteamentoProvider.js'
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';

export class GrpcRoteamentoProvider implements IRoteamentoProvider {
  calcularResumo(origem: Coordenada, destino: Coordenada): Promise<ResumoRota> {
    return new Promise((resolve, reject) => {
      roteamentoClient.CalcularResumoRota(
        {
          origem: { latitude: origem.latitude, longitude: origem.longitude },
          destino: { latitude: destino.latitude, longitude: destino.longitude }
        },
        (error, response) => {
          if (error) return reject(error)
          resolve(response as ResumoRota)
        }
      )
    })
  }

  obterGeometria(origem: Coordenada, destino: Coordenada): Promise<GeometriaRota> {
    return new Promise((resolve, reject) => {
      roteamentoClient.ObterGeometriaRota(
        {
          origem: { latitude: origem.latitude, longitude: origem.longitude },
          destino: { latitude: destino.latitude, longitude: destino.longitude }
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
