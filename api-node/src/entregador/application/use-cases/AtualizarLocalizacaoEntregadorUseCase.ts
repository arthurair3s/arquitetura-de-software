import type { IEntregadorRepository } from '../../domain/ports/IEntregadorRepository.js'
import { EntregadorInvalidoError } from '../../domain/Entregador.js'

export class AtualizarLocalizacaoEntregadorUseCase {
  constructor(private readonly repository: IEntregadorRepository) {}

  async execute(id: number | string, latitude: number, longitude: number): Promise<boolean> {
    if (latitude < -90 || latitude > 90) throw new EntregadorInvalidoError('Latitude inválida')
    if (longitude < -180 || longitude > 180) throw new EntregadorInvalidoError('Longitude inválida')
    return this.repository.atualizarLocalizacao(id, latitude, longitude)
  }
}
