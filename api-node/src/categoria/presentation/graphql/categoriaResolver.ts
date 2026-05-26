import { diContainer } from '../../../shared/infrastructure/container.js'
import { createCategoriaQuery } from './categoriaQuery.js'
import { createCategoriaMutation } from './categoriaMutation.js'
import { Categoria } from '../../domain/Categoria.js'

const service = diContainer.getCategoriaService()
const restauranteService = diContainer.getRestauranteService()
const produtoService = diContainer.getProdutoService()

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
