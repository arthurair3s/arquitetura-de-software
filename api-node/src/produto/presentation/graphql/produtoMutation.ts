import type { IProdutoService } from '../../application/ports/IProdutoService.js'

export const createProdutoMutation = (service: IProdutoService) => ({
  criarProduto: async (_: any, args: {
    nome: string
    preco: number
    descricao?: string
    categoria_id?: string
  }) => service.criar(args),

  editarProduto: async (_: any, args: {
    id: string
    nome?: string
    preco?: number
    descricao?: string
    categoria_id?: string
  }) => {
    const { id, ...dados } = args
    return service.editarPorId(id, dados)
  },

  deletarProduto: async (_: any, { id }: { id: string }) =>
    !!(await service.deletar(id))
})
