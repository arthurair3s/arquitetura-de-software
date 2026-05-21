import { CategoriaRepository } from '../infrastructure/categoriaRepository.js'
import { CategoriaAppService } from '../application/categoriaService.js'
import { createCategoriaQuery } from './categoriaQuery.js'
import { createCategoriaMutation } from './categoriaMutation.js'
import * as restauranteService from '../../restaurante/restauranteService.js'
import * as produtoService from '../../produto/produtoService.js'
import { Categoria } from '../domain/Categoria.js'

// inicialização das dependências do módulo
const repository = new CategoriaRepository()
const service = new CategoriaAppService(repository)

export const categoriaResolver = {
  Query: createCategoriaQuery(service),
  Mutation: createCategoriaMutation(service),
  Categoria: {
    restaurante: async (parent: Categoria) => {
      if (!parent.restaurante_id) return null
      return restauranteService.buscarPorId(parent.restaurante_id)
    },
    produtos: async (parent: Categoria) => {
      if (!parent.id) return []
      return produtoService.buscarPorCategoria(parent.id)
    }
  },
  Restaurante: {
    categorias: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorRestaurante(parent.id)
    }
  }
}
