import type { IProdutoService } from '../../application/ports/IProdutoService.js'

export const createProdutoMutation = (service: IProdutoService) => ({
  criarProduto: async (_: any, args: {
    nome: string
    preco: number
    descricao?: string
    categoria_id?: string
  }) => {
    const produto = await service.criar(args)
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
    const produto = await service.editarPorId(id, dados)
    return produto
  },

  deletarProduto: async (_: any, { id }: { id: string }) => {
    const result = !!(await service.deletar(id))
    return result
  }
})
