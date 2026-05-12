import { prisma } from '../infra/database/connection.js'
import { Categoria } from './domain/Categoria.js'

export const listarCategorias = async (): Promise<Categoria[]> => {
  const categorias = await prisma.categorias.findMany()
  return categorias.map((c) => Categoria.criar(c))
}

export const buscarCategoriaPorId = async (id: number | string): Promise<Categoria | null> => {
  const categoria = await prisma.categorias.findUnique({
    where: { id: Number(id) }
  })
  if (!categoria) return null
  return Categoria.criar(categoria)
}

export const buscarCategoriasPorRestaurante = async (restaurante_id: number | string): Promise<Categoria[]> => {
  const categorias = await prisma.categorias.findMany({
    where: { restaurante_id: Number(restaurante_id) }
  })
  return categorias.map((c) => Categoria.criar(c))
}

export const criarCategoria = async (categoria: Categoria): Promise<Categoria> => {
  const novaCategoria = await prisma.categorias.create({
    data: { 
      nome: categoria.nome, 
      restaurante_id: categoria.restaurante_id ? Number(categoria.restaurante_id) : undefined 
    }
  })
  return Categoria.criar(novaCategoria)
}

export const editarCategoriaPorId = async (id: number | string, categoria: Partial<Categoria>): Promise<Categoria> => {
  const categoriaAtualizada = await prisma.categorias.update({
    where: { id: Number(id) },
    data: {
      nome: categoria.nome,
      restaurante_id: categoria.restaurante_id ? Number(categoria.restaurante_id) : undefined
    }
  })
  return Categoria.criar(categoriaAtualizada)
}

export const deletarCategoria = async (id: number | string): Promise<boolean> => {
  await prisma.categorias.delete({
    where: { id: Number(id) }
  })
  return true
}
