import type { IEntregadorRepository } from '../../domain/ports/IEntregadorRepository.js'
import type { IRoteamentoProvider } from '../../../roteamento/domain/ports/IRoteamentoProvider.js'
import type { IEntregadorService } from '../ports/IEntregadorService.js'
import { Entregador } from '../../domain/Entregador.js'
import { logger } from '../../../shared/utils/logger.js'

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
]

export class PovoarFrotaUseCase {
  private simulacaoInterval: any = null
  private motoristasBases = new Map<number, { lat: number; lng: number }>()

  constructor(
    private readonly repository: IEntregadorRepository,
    private readonly roteamentoProvider: IRoteamentoProvider,
    private readonly entregadorService: IEntregadorService
  ) {}

  async execute(): Promise<boolean> {
    if (this.simulacaoInterval) return true

    let entregadores = await this.repository.listarEntregadores()
    const frotaDesejada = 50

    if (entregadores.length < frotaDesejada) {
      const faltam = frotaDesejada - entregadores.length
      for (let i = 1; i <= faltam; i++) {
        try {
          const entregador = Entregador.criar({
            nome: `Motoqueiro ${i} (Simulado)`,
            telefone: `219${Math.floor(Math.random() * 90000000 + 10000000)}`,
            veiculo: 'Moto Honda CG 160'
          })
          await this.repository.criarEntregador(entregador)
        } catch (e: any) {
          logger.error(`Erro ao criar entregador simulado: ${e.message}`, 'Simulação')
        }
      }
      entregadores = await this.repository.listarEntregadores()
    }

    const runSimulationTick = async () => {
      try {
        const atuais = await this.repository.listarEntregadores()
        for (const e of atuais) {
          if (e.status !== 'DISPONIVEL') continue
          if (e.id == null || this.entregadorService.estaEmSimulacao(e.id)) continue

          if (!this.motoristasBases.has(e.id)) {
            const hub = HUBS_RJ[Math.floor(Math.random() * HUBS_RJ.length)]
            const offsetLat = (Math.random() - 0.5) * 0.05
            const offsetLng = (Math.random() - 0.5) * 0.05
            this.motoristasBases.set(e.id, {
              lat: hub.lat + offsetLat,
              lng: hub.lng + offsetLng
            })
          }

          const base = this.motoristasBases.get(e.id)!
          const jumpLat = (Math.random() - 0.5) * 0.05
          const jumpLng = (Math.random() - 0.5) * 0.05

          const latRaw = base.lat + jumpLat
          const lngRaw = base.lng + jumpLng

          try {
            const snapped = await this.roteamentoProvider.encaixarNaEstrada(latRaw, lngRaw)
            await this.entregadorService.atualizarLocalizacao(e.id, snapped.latitude, snapped.longitude)
          } catch (err) {
            // ignore individual errors
          }
        }
      } catch (err: any) {
        logger.error(`Falha na simulação de frota: ${err.message}`, 'Simulação')
      }

      this.simulacaoInterval = setTimeout(runSimulationTick, 3000)
    }

    this.simulacaoInterval = setTimeout(runSimulationTick, 3000)
    return true
  }
}
