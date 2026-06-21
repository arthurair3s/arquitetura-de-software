import type { IEntregadorRepository } from '../../domain/ports/IEntregadorRepository.js'
import type { IEntregadorService } from '../ports/IEntregadorService.js'
import type { IRestauranteService } from '../../../restaurante/application/ports/IRestauranteService.js'
import { Entregador, EntregadorInvalidoError } from '../../domain/Entregador.js'

const motoristasEmSimulacao = new Set<number>()

export class EntregadorAppService implements IEntregadorService {
  constructor(
    private readonly repository: IEntregadorRepository,
    private readonly restauranteService: IRestauranteService
  ) {}

  bloquearParaSimulacao(id: number | string): void { motoristasEmSimulacao.add(Number(id)); }
  liberarDeSimulacao(id: number | string): void { motoristasEmSimulacao.delete(Number(id)); }
  estaEmSimulacao(id: number | string): boolean { return motoristasEmSimulacao.has(Number(id)); }

  async criar(dados: { nome?: string; telefone?: string | null; veiculo?: string | null }): Promise<Entregador> {
    const entregador = Entregador.criar({
      nome: dados.nome,
      telefone: dados.telefone,
      veiculo: dados.veiculo
    });
    return this.repository.criarEntregador(entregador);
  }

  async listarProximos(latitude: number, longitude: number, raioKm: number): Promise<Entregador[]> {
    return this.repository.listarProximos(latitude, longitude, raioKm);
  }

  async listarProximosAoRestaurante(restauranteId: number | string, raioKm: number): Promise<Entregador[]> {
    const restaurante = await this.restauranteService.buscarPorId(restauranteId)
    if (!restaurante || restaurante.latitude == null || restaurante.longitude == null) {
      throw new EntregadorInvalidoError('Restaurante não encontrado ou sem coordenadas geográficas.')
    }
    return this.repository.listarProximos(restaurante.latitude, restaurante.longitude, raioKm);
  }

  async buscarPorId(id: number | string): Promise<Entregador | null> {
    return this.repository.buscarEntregadorPorId(id);
  }

  async editarPorId(id: number | string, dados: { nome?: string; telefone?: string | null; veiculo?: string | null }): Promise<Entregador> {
    const entregadorAtual = await this.repository.buscarEntregadorPorId(id);
    if (!entregadorAtual) throw new EntregadorInvalidoError('Entregador não encontrado');
    if (dados.nome !== undefined) entregadorAtual.nome = dados.nome || null;
    if (dados.telefone !== undefined) entregadorAtual.telefone = dados.telefone || null;
    if (dados.veiculo !== undefined) entregadorAtual.veiculo = dados.veiculo || null;
    return this.repository.editarEntregadorPorId(id, entregadorAtual);
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarEntregador(id);
  }

  async listar(): Promise<Entregador[]> {
    return this.repository.listarEntregadores();
  }

  async atualizarStatus(id: number | string, novoStatus: string): Promise<Entregador> {
    return this.repository.atualizarStatus(id, novoStatus);
  }

  async atualizarLocalizacao(id: number | string, latitude: number, longitude: number): Promise<boolean> {
    if (latitude < -90 || latitude > 90) throw new EntregadorInvalidoError('Latitude inválida');
    if (longitude < -180 || longitude > 180) throw new EntregadorInvalidoError('Longitude inválida');
    return this.repository.atualizarLocalizacao(id, latitude, longitude);
  }

  finalizarStreamLocalizacao(id: number | string): void {
    this.repository.finalizarStreamLocalizacao(id);
  }
}
