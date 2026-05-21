import { Restaurante } from '../Restaurante.js'

export interface IRestauranteRepository {
  listarRestaurantes(): Promise<Restaurante[]>
  buscarRestaurantePorId(id: number | string): Promise<Restaurante | null>
  criarRestaurante(restaurante: Restaurante): Promise<Restaurante>
  editarRestaurantePorId(id: number | string, restaurante: Partial<Restaurante>): Promise<Restaurante>
  deletarRestaurante(id: number | string): Promise<boolean>
}
