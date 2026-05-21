import { prisma } from '../../infra/database/connection.js'
import { Categoria } from '../domain/Categoria.js'
import type { ICategoriaRepository } from '../domain/ICategoriaRepository.js'

export class CategoriaRepository implements ICategoriaRepository {
  async listarCategorias(): Promise<Categoria[]> {
    const categorias = await prisma.categorias.findMany()
    return categorias.map((c) => Categoria.criar(c))
  }

  async buscarCategoriaPorId(id: number | string): Promise<Categoria | null> {
    const categoria = await prisma.categorias.findUnique({
      where: { id: Number(id) }
    })
    if (!categoria) return null
    return Categoria.criar(categoria)
  }

  async buscarCategoriasPorRestaurante(restaurante_id: number | string): Promise<Categoria[]> {
    const categorias = await prisma.categorias.findMany({
      where: { restaurante_id: Number(restaurante_id) }
    })
    return categorias.map((c) => Categoria.criar(c))
  }

  async criarCategoria(categoria: Categoria): Promise<Categoria> {
    const novaCategoria = await prisma.categorias.create({
      data: { 
        nome: categoria.nome, 
        restaurante_id: categoria.restaurante_id != null ? Number(categoria.restaurante_id) : undefined 
      }
    })
    return Categoria.criar(novaCategoria)
  }

  async editarCategoriaPorId(id: number | string, categoria: Partial<Categoria>): Promise<Categoria> {
    const categoriaAtualizada = await prisma.categorias.update({
      where: { id: Number(id) },
      data: {
        nome: categoria.nome,
        restaurante_id: categoria.restaurante_id != null ? Number(categoria.restaurante_id) : undefined
      }
    })
    return Categoria.criar(categoriaAtualizada)
  }

  async deletarCategoria(id: number | string): Promise<boolean> {
    await prisma.categorias.delete({
      where: { id: Number(id) }
    })
    return true
  }
}

export const categoriaRepository = new CategoriaRepository();
