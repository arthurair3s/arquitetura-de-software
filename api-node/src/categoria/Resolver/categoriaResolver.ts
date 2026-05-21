import { Query } from './categoriaQuery.js'
import { Mutation } from './categoriaMutation.js'
import * as restauranteService from '../../restaurante/restauranteService.js'
import * as produtoService from '../../produto/produtoService.js'
import { Categoria } from '../domain/Categoria.js'

export const categoriaResolver = {
  Query,
  Mutation,
  Categoria: {
    restaurante: async (parent: Categoria) => {
      if (!parent.restaurante_id) return null
      return restauranteService.buscarPorId(parent.restaurante_id)
    },
    produtos: async (parent: Categoria) => {
      if (!parent.id) return []
      return produtoService.buscarPorCategoria(parent.id)
    }
  }
}
