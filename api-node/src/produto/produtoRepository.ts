import { prisma } from '../infra/database/connection.js'
import { Produto } from './domain/Produto.js'

export const listarProdutos = async (): Promise<Produto[]> => {
  const produtos = await prisma.produtos.findMany()
  return produtos.map((p) => Produto.criar(p))
}

export const buscarProdutoPorId = async (id: number | string): Promise<Produto | null> => {
  const produto = await prisma.produtos.findUnique({
    where: { id: Number(id) }
  })
  if (!produto) return null
  return Produto.criar(produto)
}

export const buscarProdutosPorCategoria = async (categoria_id: number | string): Promise<Produto[]> => {
  const produtos = await prisma.produtos.findMany({
    where: { categoria_id: Number(categoria_id) }
  })
  return produtos.map((p) => Produto.criar(p))
}

export const criarProduto = async (produto: Produto): Promise<Produto> => {
  const novoProduto = await prisma.produtos.create({
    data: {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria_id: produto.categoria_id != null ? Number(produto.categoria_id) : undefined
    }
  })
  return Produto.criar(novoProduto)
}

export const editarProdutoPorId = async (id: number | string, produto: Partial<Produto>): Promise<Produto> => {
  const produtoAtualizado = await prisma.produtos.update({
    where: { id: Number(id) },
    data: {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoria_id: produto.categoria_id != null ? Number(produto.categoria_id) : undefined
    }
  })
  return Produto.criar(produtoAtualizado)
}

export const deletarProduto = async (id: number | string): Promise<boolean> => {
  await prisma.produtos.delete({
    where: { id: Number(id) }
  })
  return true
}
