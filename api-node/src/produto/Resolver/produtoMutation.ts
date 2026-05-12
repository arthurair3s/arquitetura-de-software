import * as produtoService from '../produtoService.js'

export const Mutation = {
  criarProduto: async (_: any, args: { 
    nome: string; 
    preco: number; 
    descricao?: string; 
    categoria_id?: string 
  }) => produtoService.criar(args),

  editarProduto: async (_: any, args: { 
    id: string; 
    nome?: string; 
    preco?: number; 
    descricao?: string; 
    categoria_id?: string 
  }) => {
    const { id, ...dados } = args
    return produtoService.editarPorId(id, dados)
  },

  deletarProduto: async (_: any, { id }: { id: string }) => 
    !!(await produtoService.deletar(id))
}
