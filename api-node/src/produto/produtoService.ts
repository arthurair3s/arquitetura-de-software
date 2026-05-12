import * as produtoRepository from './produtoRepository.js'
import { Produto } from './domain/Produto.js'

export const listar = async (): Promise<Produto[]> => {
  return produtoRepository.listarProdutos()
}

export const buscarPorId = async (id: number | string): Promise<Produto | null> => {
  return produtoRepository.buscarProdutoPorId(id)
}

export const buscarPorCategoria = async (categoria_id: number | string): Promise<Produto[]> => {
  return produtoRepository.buscarProdutosPorCategoria(categoria_id)
}

export const criar = async (dados: { 
  nome: string; 
  preco: number; 
  descricao?: string; 
  categoria_id?: string 
}): Promise<Produto> => {
  const produto = new Produto(
    dados.nome,
    dados.preco,
    undefined,
    dados.descricao,
    dados.categoria_id ? Number(dados.categoria_id) : null
  );
  return produtoRepository.criarProduto(produto)
}

export const editarPorId = async (id: number | string, dados: { 
  nome?: string; 
  preco?: number; 
  descricao?: string; 
  categoria_id?: string 
}): Promise<Produto> => {
  const produtoAtual = await produtoRepository.buscarProdutoPorId(id);
  if (!produtoAtual) {
    throw new Error('Produto não encontrado');
  }

  if (dados.nome !== undefined) produtoAtual.nome = dados.nome;
  if (dados.preco !== undefined) produtoAtual.preco = Number(dados.preco);
  if (dados.descricao !== undefined) produtoAtual.descricao = dados.descricao;
  // categoria_id é readonly no momento, mas pode ser atualizada via repo se não tiver regra associada
  const updateData: Partial<Produto> = {
    nome: produtoAtual.nome,
    preco: produtoAtual.preco,
    descricao: produtoAtual.descricao,
    categoria_id: dados.categoria_id != null ? Number(dados.categoria_id) : produtoAtual.categoria_id
  };

  return produtoRepository.editarProdutoPorId(id, updateData)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return produtoRepository.deletarProduto(id)
}