import * as avaliacaoRepository from './avaliacaoRepository.js'
import { Avaliacao, AvaliacaoInvalidaError } from './domain/Avaliacao.js'

export const listar = async (): Promise<Avaliacao[]> => {
  return avaliacaoRepository.listarAvaliacoes()
}

export const buscarPorId = async (id: number | string): Promise<Avaliacao | null> => {
  return avaliacaoRepository.buscarAvaliacaoPorId(id)
}

export const criar = async (dados: { 
  usuario_id: string; 
  restaurante_id: string; 
  nota: number; 
  comentario?: string 
}): Promise<Avaliacao> => {
  const avaliacao = new Avaliacao(
    dados.nota,
    Number(dados.usuario_id),
    Number(dados.restaurante_id),
    dados.comentario
  );
  return avaliacaoRepository.criarAvaliacao(avaliacao)
}

export const editarPorId = async (id: number | string, dados: { 
  nota?: number; 
  comentario?: string 
}): Promise<Avaliacao> => {
  const avaliacaoAtual = await avaliacaoRepository.buscarAvaliacaoPorId(id);
  if (!avaliacaoAtual) {
    throw new AvaliacaoInvalidaError('Avaliação não encontrada');
  }

  if (dados.nota !== undefined) avaliacaoAtual.nota = Number(dados.nota);
  if (dados.comentario !== undefined) avaliacaoAtual.comentario = dados.comentario;

  return avaliacaoRepository.editarAvaliacaoPorId(id, avaliacaoAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return avaliacaoRepository.deletarAvaliacao(id)
}
