import { DomainError } from '../../errors/DomainError.js';

export class CoordenadaInvalidaError extends DomainError {
  constructor(message: string) {
    super(message, 'COORDENADA_INVALIDA');
    this.name = 'CoordenadaInvalidaError';
  }
}

export class Coordenada {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {
    this.validar();
  }

  private validar(): void {
    if (this.latitude < -90 || this.latitude > 90) {
      throw new CoordenadaInvalidaError('A latitude deve estar entre -90 e 90.');
    }
    if (this.longitude < -180 || this.longitude > 180) {
      throw new CoordenadaInvalidaError('A longitude deve estar entre -180 e 180.');
    }
  }

  public equals(outra: Coordenada): boolean {
    return this.latitude === outra.latitude && this.longitude === outra.longitude;
  }

  /**
   * calcula a distância entre duas coordenadas em quilômetros usando a fórmula de Haversine.
   */
  public calcularDistanciaKm(outra: Coordenada): number {
    const R = 6371; // raio da Terra em km
    const dLat = this.toRad(outra.latitude - this.latitude);
    const dLon = this.toRad(outra.longitude - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(outra.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(valor: number): number {
    return (valor * Math.PI) / 180;
  }
}
