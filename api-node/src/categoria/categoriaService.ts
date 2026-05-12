import * as categoriaRepository from './categoriaRepository.js'
import { Categoria } from './domain/Categoria.js'

export const listar = async (): Promise<Categoria[]> => {
  return categoriaRepository.listarCategorias()
}

export const buscarPorId = async (id: number | string): Promise<Categoria | null> => {
  return categoriaRepository.buscarCategoriaPorId(id)
}

export const buscarPorRestaurante = async (restaurante_id: number | string): Promise<Categoria[]> => {
  return categoriaRepository.buscarCategoriasPorRestaurante(restaurante_id)
}

// O Input vem do GraphQL, validamos usando a Entidade
export const criar = async (dados: { nome: string; restaurante_id: string }): Promise<Categoria> => {
  const categoria = new Categoria(dados.nome, undefined, Number(dados.restaurante_id));
  return categoriaRepository.criarCategoria(categoria)
}

export const editarPorId = async (id: number | string, dados: { nome?: string; restaurante_id?: number }): Promise<Categoria> => {
  const categoriaAtual = await categoriaRepository.buscarCategoriaPorId(id);
  if (!categoriaAtual) {
    throw new Error('Categoria não encontrada');
  }

  if (dados.nome !== undefined) {
    categoriaAtual.nome = dados.nome;
  }
  
  const updateData: { nome?: string; restaurante_id?: number } = {
    nome: categoriaAtual.nome,
    restaurante_id: dados.restaurante_id != null ? Number(dados.restaurante_id) : categoriaAtual.restaurante_id || undefined
  };

  return categoriaRepository.editarCategoriaPorId(id, updateData)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return categoriaRepository.deletarCategoria(id)
}
