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

export interface IRoteamentoProvider {
  calcularResumo(origemLat: number, origemLon: number, destinoLat: number, destinoLon: number): Promise<ResumoRota>
  obterGeometria(origemLat: number, origemLon: number, destinoLat: number, destinoLon: number): Promise<GeometriaRota>
  calcularMultiplosPontos(pontos: PontoRota[]): Promise<GeometriaRota>
  encaixarNaEstrada(latitude: number, longitude: number): Promise<PontoRota>
}
