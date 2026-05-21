import * as restauranteRepository from './restauranteRepository.js'
import { Restaurante, RestauranteInvalidoError } from './domain/Restaurante.js'

export const listar = async (): Promise<Restaurante[]> => {
  return restauranteRepository.listarRestaurantes()
}

export const buscarPorId = async (id: number | string): Promise<Restaurante | null> => {
  return restauranteRepository.buscarRestaurantePorId(id)
}

export const criar = async (dados: {
  nome: string;
  descricao?: string | null;
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<Restaurante> => {
  const restaurante = new Restaurante(
    dados.nome,
    dados.descricao,
    dados.endereco,
    dados.latitude,
    dados.longitude
  );
  return restauranteRepository.criarRestaurante(restaurante)
}

export const editarPorId = async (id: number | string, dados: {
  nome?: string;
  descricao?: string | null;
  endereco?: string | null;
}): Promise<Restaurante> => {
  const restauranteAtual = await restauranteRepository.buscarRestaurantePorId(id);
  if (!restauranteAtual) {
    throw new RestauranteInvalidoError('Restaurante não encontrado');
  }

  if (dados.nome !== undefined) restauranteAtual.nome = dados.nome;
  if (dados.descricao !== undefined) restauranteAtual.descricao = dados.descricao;
  if (dados.endereco !== undefined) restauranteAtual.endereco = dados.endereco;

  return restauranteRepository.editarRestaurantePorId(id, restauranteAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return restauranteRepository.deletarRestaurante(id)
}