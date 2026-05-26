import { diContainer } from '../../../shared/infrastructure/container.js'
import { createProdutoQuery } from './produtoQuery.js'
import { createProdutoMutation } from './produtoMutation.js'
import { Produto } from '../../domain/Produto.js'

const service = diContainer.getProdutoService()
const categoriaService = diContainer.getCategoriaService()

export const produtoResolver = {
  Query: createProdutoQuery(service),
  Mutation: createProdutoMutation(service),
  Produto: {
    categoria: async (parent: Produto) => {
      if (!parent.categoria_id) return null
      return categoriaService.buscarPorId(parent.categoria_id)
    }
  },
  Categoria: {
    produtos: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorCategoria(parent.id)
    }
  }
}
