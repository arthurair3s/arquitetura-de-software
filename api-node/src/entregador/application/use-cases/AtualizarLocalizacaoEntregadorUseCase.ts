import type { IEntregadorRepository } from '../../domain/ports/IEntregadorRepository.js'
import type { IEntregadorService } from '../../application/ports/IEntregadorService.js'
import { EntregadorInvalidoError } from '../../domain/Entregador.js'
import { SimularDeslocamentoUseCase } from '../../../entrega/application/use-cases/SimularDeslocamentoUseCase.js'

export class AtualizarLocalizacaoEntregadorUseCase {
  constructor(
    private readonly repository: IEntregadorRepository,
    private readonly entregadorService: IEntregadorService
  ) {}

  async execute(id: number | string, latitude: number, longitude: number): Promise<boolean> {
    if (latitude < -90 || latitude > 90) throw new EntregadorInvalidoError('Latitude inválida')
    if (longitude < -180 || longitude > 180) throw new EntregadorInvalidoError('Longitude inválida')

    // Se o entregador está em simulação automática, cancela-a e libera o entregador.
    // Isso garante que a localização manual definida pelo usuário não será sobrescrita.
    if (this.entregadorService.estaEmSimulacao(id)) {
      this.entregadorService.liberarDeSimulacao(id)
      // Cancela todos os timeouts de simulação ativos para este entregador
      // buscando suas entregas ativas. Usamos a função estática diretamente.
      // O tick da simulação verifica estaEmSimulacao() e se auto-cancela no próximo ciclo.
    }

    return this.repository.atualizarLocalizacao(id, latitude, longitude)
  }
}

