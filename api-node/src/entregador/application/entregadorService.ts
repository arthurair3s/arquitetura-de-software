import type { IEntregadorRepository } from '../domain/IEntregadorRepository.js'
import type { RestauranteAppService } from '../../restaurante/application/restauranteService.js'
import type { IRoteamentoProvider } from '../../roteamento/domain/IRoteamentoProvider.js'
import { Entregador, EntregadorInvalidoError } from '../domain/Entregador.js'
import { logger } from '../../shared/utils/logger.js'

let simulacaoInterval: any = null;
const motoristasBases = new Map<number, { lat: number; lng: number }>();

const HUBS_RJ = [
  { name: 'Copacabana', lat: -22.9711, lng: -43.1822 },
  { name: 'Centro', lat: -22.9035, lng: -43.1730 },
  { name: 'Maracanã', lat: -22.9126, lng: -43.2301 },
  { name: 'Cachambi / Norte Shopping', lat: -22.8860, lng: -43.2770 },
  { name: 'Méier', lat: -22.9022, lng: -43.2800 },
  { name: 'Madureira', lat: -22.8735, lng: -43.3360 },
  { name: 'Barra da Tijuca', lat: -23.0003, lng: -43.3658 },
  { name: 'Recreio', lat: -23.0183, lng: -43.4672 },
  { name: 'Bangu', lat: -22.8741, lng: -43.4646 },
  { name: 'Ilha do Governador', lat: -22.8092, lng: -43.2039 }
];

const motoristasEmSimulacao = new Set<number>();

export class EntregadorAppService {
  constructor(
    private readonly repository: IEntregadorRepository,
    private readonly restauranteService: RestauranteAppService,
    private readonly roteamentoProvider: IRoteamentoProvider
  ) {}

  bloquearParaSimulacao(id: number | string): void { motoristasEmSimulacao.add(Number(id)); }
  liberarDeSimulacao(id: number | string): void { motoristasEmSimulacao.delete(Number(id)); }
  estaEmSimulacao(id: number | string): boolean { return motoristasEmSimulacao.has(Number(id)); }

  async criar(dados: { nome?: string; telefone?: string | null; veiculo?: string | null }): Promise<Entregador> {
    const entregador = new Entregador(dados.nome, dados.telefone, dados.veiculo);
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

  async povoarFrota(): Promise<boolean> {
    if (simulacaoInterval) return true;

    let entregadores = await this.listar();
    const frotaDesejada = 50;
    
    if (entregadores.length < frotaDesejada) {
      const faltam = frotaDesejada - entregadores.length;
      for (let i = 1; i <= faltam; i++) {
        try {
          await this.criar({
            nome: `Motoqueiro ${i} (Simulado)`,
            telefone: `219${Math.floor(Math.random() * 90000000 + 10000000)}`,
            veiculo: 'Moto Honda CG 160'
          });
        } catch (e: any) {
          logger.error(`Erro ao criar entregador simulado: ${e.message}`, 'Simulação');
        }
      }
      entregadores = await this.listar();
    }

    simulacaoInterval = setInterval(async () => {
      try {
        const atuais = await this.listar();
        atuais.forEach(async (e: Entregador) => {
          if (e.status !== 'DISPONIVEL') return;
          if (e.id == null || this.estaEmSimulacao(e.id)) return;

          if (!motoristasBases.has(e.id)) {
            const hub = HUBS_RJ[Math.floor(Math.random() * HUBS_RJ.length)];
            const offsetLat = (Math.random() - 0.5) * 0.05;
            const offsetLng = (Math.random() - 0.5) * 0.05;
            motoristasBases.set(e.id, { 
              lat: hub.lat + offsetLat, 
              lng: hub.lng + offsetLng 
            });
          }
          
          const base = motoristasBases.get(e.id)!;
          const jumpLat = (Math.random() - 0.5) * 0.05;
          const jumpLng = (Math.random() - 0.5) * 0.05;
          
          const latRaw = base.lat + jumpLat;
          const lngRaw = base.lng + jumpLng;

          const snapped = await this.roteamentoProvider.encaixarNaEstrada(latRaw, lngRaw)

          try {
            await this.atualizarLocalizacao(e.id, snapped.latitude, snapped.longitude);
          } catch (err) {
            // ignore
          }
        });
      } catch (err: any) {
         logger.error(`Falha ao consultar lista na simulação: ${err.message}`, 'Simulação');
      }
    }, 3000);

    return true;
  }
}
