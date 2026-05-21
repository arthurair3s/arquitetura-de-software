import { CategoriaRepository } from '../../infrastructure/adapters/categoriaRepository.js'
import { CategoriaAppService } from '../../application/services/categoriaService.js'
import { createCategoriaQuery } from './categoriaQuery.js'
import { createCategoriaMutation } from './categoriaMutation.js'
import { RestauranteAppService } from '../../../restaurante/application/services/restauranteService.js'
import { RestauranteRepository } from '../../../restaurante/infrastructure/adapters/restauranteRepository.js'
import { ProdutoAppService } from '../../../produto/application/services/produtoService.js'
import { ProdutoRepository } from '../../../produto/infrastructure/adapters/produtoRepository.js'
import { Categoria } from '../../domain/Categoria.js'

const restauranteService = new RestauranteAppService(new RestauranteRepository())
const produtoService = new ProdutoAppService(new ProdutoRepository())

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
