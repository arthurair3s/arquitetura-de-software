import { ProdutoRepository } from '../../infrastructure/adapters/produtoRepository.js'
import { ProdutoAppService } from '../../application/services/produtoService.js'
import { CategoriaRepository } from '../../../categoria/infrastructure/adapters/categoriaRepository.js'
import { CategoriaAppService } from '../../../categoria/application/services/categoriaService.js'
import { createProdutoQuery } from './produtoQuery.js'
import { createProdutoMutation } from './produtoMutation.js'
import { Produto } from '../../domain/Produto.js'

// inicialização das dependências do módulo
const repository = new ProdutoRepository()
const service = new ProdutoAppService(repository)

// serviço de categoria para busca de relações
const categoriaService = new CategoriaAppService(new CategoriaRepository())

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
