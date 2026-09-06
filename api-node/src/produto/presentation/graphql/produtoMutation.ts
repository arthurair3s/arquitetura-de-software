import type { IProdutoService } from '../../application/ports/IProdutoService.js'
import { catalogEventPublisher } from '../../../shared/infrastructure/messaging/catalogEventPublisher.js'

export const createProdutoMutation = (service: IProdutoService) => ({
  criarProduto: async (_: any, args: {
    nome: string
    preco: number
    descricao?: string
    categoria_id?: string
  }) => {
    const produto = await service.criar(args)
    // Evento de catálogo: replica no ms-recomendacao o novo produto
    catalogEventPublisher.produtoCriado(produto as any).catch(console.error)
    return produto
  },

  editarProduto: async (_: any, args: {
    id: string
    nome?: string
    preco?: number
    descricao?: string
    categoria_id?: string
  }) => {
    const { id, ...dados } = args
    const antes = await service.buscarPorId(id)
    const produto = await service.editarPorId(id, dados)
    // Evento de catálogo: replica no ms-recomendacao a atualização
    catalogEventPublisher.produtoAtualizado(antes as any, produto as any).catch(console.error)
    return produto
  },

  deletarProduto: async (_: any, { id }: { id: string }) => {
    const antes = await service.buscarPorId(id)
    const result = !!(await service.deletar(id))
    // Evento de catálogo: replica no ms-recomendacao a remoção
    if (result && antes) {
      catalogEventPublisher.produtoDeletado(antes as any).catch(console.error)
    }
    return result
  }
})
