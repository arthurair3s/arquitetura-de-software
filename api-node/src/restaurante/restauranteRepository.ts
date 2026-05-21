import { prisma } from '../infra/database/connection.js'
import { Restaurante } from './domain/Restaurante.js'

export const listarRestaurantes = async (): Promise<Restaurante[]> => {
  const restaurantes = await prisma.restaurantes.findMany()
  return restaurantes.map((r) => Restaurante.criar(r))
}

export const buscarRestaurantePorId = async (id: number | string): Promise<Restaurante | null> => {
  const restaurante = await prisma.restaurantes.findUnique({
    where: { id: Number(id) }
  })
  if (!restaurante) return null
  return Restaurante.criar(restaurante)
}

export const criarRestaurante = async (restaurante: Restaurante): Promise<Restaurante> => {
  const novoRestaurante = await prisma.restaurantes.create({
    data: {
      nome: restaurante.nome,
      descricao: restaurante.descricao,
      endereco: restaurante.endereco,
      latitude: restaurante.latitude != null ? Number(restaurante.latitude) : undefined,
      longitude: restaurante.longitude != null ? Number(restaurante.longitude) : undefined
    }
  })
  return Restaurante.criar(novoRestaurante)
}

export const editarRestaurantePorId = async (id: number | string, restaurante: Partial<Restaurante>): Promise<Restaurante> => {
  const restauranteAtualizado = await prisma.restaurantes.update({
    where: { id: Number(id) },
    data: {
      nome: restaurante.nome,
      descricao: restaurante.descricao,
      endereco: restaurante.endereco,
      latitude: restaurante.latitude !== undefined ? (restaurante.latitude != null ? Number(restaurante.latitude) : null) : undefined,
      longitude: restaurante.longitude !== undefined ? (restaurante.longitude != null ? Number(restaurante.longitude) : null) : undefined
    }
  })
  return Restaurante.criar(restauranteAtualizado)
}

export const deletarRestaurante = async (id: number | string): Promise<boolean> => {
  await prisma.restaurantes.delete({
    where: { id: Number(id) }
  })
  return true
}
