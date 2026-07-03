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
    // Outbox: notifica o ms-recomendacao sobre o novo produto
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
    // Outbox: notifica o ms-recomendacao sobre a atualização
    catalogEventPublisher.produtoAtualizado(antes as any, produto as any).catch(console.error)
    return produto
  },

  deletarProduto: async (_: any, { id }: { id: string }) => {
    const antes = await service.buscarPorId(id)
    const result = !!(await service.deletar(id))
    // Outbox: notifica o ms-recomendacao sobre a remoção
    if (result && antes) {
      catalogEventPublisher.produtoDeletado(antes as any).catch(console.error)
    }
    return result
  }
})
