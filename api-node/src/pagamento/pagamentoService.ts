import * as pagamentoRepository from './pagamentoRepository.js'
import { Pagamento, PagamentoInvalidoError } from './domain/Pagamento.js'

export const listar = async (): Promise<Pagamento[]> => {
  return pagamentoRepository.listarPagamentos()
}

export const buscarPorId = async (id: number | string): Promise<Pagamento | null> => {
  return pagamentoRepository.buscarPagamentoPorId(id)
}

export const criar = async (dados: { 
  pedido_id: string; 
  metodo?: string; 
  status?: string; 
  valor?: number 
}): Promise<Pagamento> => {
  const pagamento = new Pagamento(
    Number(dados.pedido_id),
    dados.metodo || '',
    Number(dados.valor || 0),
    dados.status || 'PENDENTE'
  );
  return pagamentoRepository.criarPagamento(pagamento)
}

export const editarPorId = async (id: number | string, dados: { 
  pedido_id?: string; 
  metodo?: string; 
  status?: string; 
  valor?: number 
}): Promise<Pagamento> => {
  const pagamentoAtual = await pagamentoRepository.buscarPagamentoPorId(id);
  if (!pagamentoAtual) {
    throw new PagamentoInvalidoError('Pagamento não encontrado');
  }

  if (dados.metodo !== undefined) pagamentoAtual.metodo = dados.metodo;
  if (dados.status !== undefined) pagamentoAtual.status = dados.status;
  if (dados.valor !== undefined) pagamentoAtual.valor = Number(dados.valor);

  return pagamentoRepository.editarPagamentoPorId(id, pagamentoAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return pagamentoRepository.deletarPagamento(id)
}
