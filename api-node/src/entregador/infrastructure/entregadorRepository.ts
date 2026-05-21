import entregadorClient from '../../grpc/entregadorClient.js'
import { Entregador } from '../domain/Entregador.js'
import { logger } from '../../shared/utils/logger.js'
import type { IEntregadorRepository } from '../domain/IEntregadorRepository.js'

const STATUS_MAP: Record<string, number> = {
  OFFLINE: 0,
  DISPONIVEL: 1,
  EM_ENTREGA: 2
};

export class EntregadorRepository implements IEntregadorRepository {
  criarEntregador(entregador: Entregador): Promise<Entregador> {
    return new Promise((resolve, reject) => {
      entregadorClient.CadastrarEntregador(
        {
          nome: entregador.nome,
          telefone: entregador.telefone,
          veiculo: entregador.veiculo
        },
        (error, response) => {
          if (error) return reject(error)
          resolve(Entregador.criar(response))
        }
      )
    })
  }

  listarProximos(latitude: number, longitude: number, raioKm: number): Promise<Entregador[]> {
    return new Promise((resolve, reject) => {
      entregadorClient.BuscarProximos(
        { latitude, longitude, raio_km: raioKm },
        (error, response) => {
          if (error) return reject(error)
          const lista = response.entregadores || []
          resolve(lista.map((e: any) => Entregador.criar(e)))
        }
      )
    })
  }

  buscarEntregadorPorId(id: number | string): Promise<Entregador | null> {
    return new Promise((resolve, reject) => {
      entregadorClient.ObterEntregadorPorId(
        { id: Number(id) },
        (error, response) => {
          if (error) {
            if (error.code === 5) return resolve(null); // NOT_FOUND
            return reject(error);
          }
          resolve(Entregador.criar(response))
        }
      )
    })
  }

  editarEntregadorPorId(id: number | string, entregador: Partial<Entregador>): Promise<Entregador> {
    return new Promise((resolve, reject) => {
      entregadorClient.EditarEntregador(
        {
          id: Number(id),
          nome: entregador.nome,
          telefone: entregador.telefone,
          veiculo: entregador.veiculo
        },
        (error, response) => {
          if (error) return reject(error)
          resolve(Entregador.criar(response))
        }
      )
    })
  }

  deletarEntregador(id: number | string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      entregadorClient.DeletarEntregador(
        { id: Number(id) },
        (error, response) => {
          if (error) return reject(error)
          resolve(response?.sucesso || false)
        }
      )
    })
  }

  listarEntregadores(): Promise<Entregador[]> {
    return new Promise((resolve, reject) => {
      entregadorClient.ListarTodosEntregadores({}, (error, response) => {
        if (error) return reject(error)
        const lista = response.entregadores || []
        resolve(lista.map((e: any) => Entregador.criar(e)))
      })
    })
  }

  atualizarStatus(id: number | string, novoStatus: string): Promise<Entregador> {
    const statusEnum = STATUS_MAP[novoStatus];
    return new Promise((resolve, reject) => {
      entregadorClient.AtualizarStatus(
        { id: Number(id), novo_status: statusEnum },
        (error, response) => {
          if (error) return reject(error);
          resolve(Entregador.criar(response));
        }
      );
    });
  }

  atualizarLocalizacao(id: number | string, latitude: number, longitude: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const stream = entregadorClient.AtualizarLocalizacaoStream((error, response) => {
        if (error) return reject(error);
        resolve(response?.sucesso || false);
      });
      const entregador_id = Number(id);
      logger.debug(`Enviando localidade -> ID: ${entregador_id}, Lat: ${latitude}, Lon: ${longitude}`, 'GRPC-STREAM');
      stream.write({ entregador_id, latitude, longitude });
      stream.end();
    });
  }
}
