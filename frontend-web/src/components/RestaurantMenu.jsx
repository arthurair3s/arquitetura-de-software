import React, { useState, useEffect } from 'react';
import { GET_RESTAURANTE_MENU, CRIAR_PEDIDO, CRIAR_PAGAMENTO } from '../graphql/queries';
import { API_URL } from '../config';

export default function RestaurantMenu({ restaurante, userLocation, onBack, onOrderCreated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // estado do carrinho de compras
  const [carrinho, setCarrinho] = useState(() => {
    try {
      const saved = localStorage.getItem(`carrinho_${restaurante.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`carrinho_${restaurante.id}`, JSON.stringify(carrinho));
  }, [carrinho, restaurante.id]);

  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_RESTAURANTE_MENU,
        variables: { id: restaurante.id }
      })
    })
      .then(r => r.json())
      .then(res => {
        if (res.errors) throw new Error(res.errors[0].message);
        setData(res.data.restaurante);
        setLoading(false);
      })
      .catch(e => {
        setError(e);
        setLoading(false);
      });
  }, [restaurante.id]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => [...prev, produto]);
  };

  const removerDoCarrinho = (indexParaRemover) => {
    setCarrinho(prev => prev.filter((_, index) => index !== indexParaRemover));
  };

  const valorTotal = carrinho.reduce((total, p) => total + Number(p.preco), 0);

  const handleComprar = async () => {
    if (carrinho.length === 0) return;
    
    // Validação de endereço obrigatório
    if (!userLocation.lat || !userLocation.lon) {
      alert("Por favor, defina seu endereço de entrega antes de finalizar o pedido!");
      return;
    }

    setCreatingOrder(true);
    setPaymentError(null);
    try {
      const savedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
      const variables = {
        usuario_id: savedUser.id || '1',
        restaurante_id: restaurante.id,
        destino_latitude: userLocation.lat,
        destino_longitude: userLocation.lon,
        valor_total: valorTotal
      };

      // 1. Criar o pedido
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: CRIAR_PEDIDO, variables })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      const pedidoId = res.data.criarPedido.id;

      // 2. Processar o pagamento com a estratégia selecionada no backend
      const paymentVariables = {
        pedido_id: pedidoId,
        metodo: metodoPagamento,
        valor: valorTotal
      };

      const payRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: CRIAR_PAGAMENTO, variables: paymentVariables })
      }).then(r => r.json());

      if (payRes.errors) throw new Error(payRes.errors[0].message);

      const statusPagamento = payRes.data.criarPagamento.status;
      if (statusPagamento === 'APROVADO') {
        localStorage.removeItem(`carrinho_${restaurante.id}`);
        onOrderCreated(pedidoId, restaurante);
      } else {
        // RECUSADO (Ex: cartão acima de 1000 reais)
        setPaymentError(
          metodoPagamento === 'CARTAO' 
            ? 'Limite insuficiente! Compras acima de R$ 1.000,00 no cartão são recusadas.' 
            : 'O gateway de pagamento rejeitou a transação.'
        );
        setCreatingOrder(false);
      }
    } catch (e) {
      console.error(e);
      alert("Falha ao criar o pedido: " + e.message);
      setCreatingOrder(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in relative flex flex-col lg:flex-row gap-8">
      {/* 1. cardapio do restaurante */}
      <div className="flex-1">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-brandRed transition-colors"
        >
          ← Voltar aos restaurantes
        </button>

        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100 flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold text-gray-900">{restaurante.nome}</h1>
          <p className="text-gray-500 flex items-center gap-2">
            📍 {restaurante.endereco || 'Endereço não cadastrado'}
          </p>
        </div>

        {loading && <p className="text-center py-10 text-gray-500">Buscando cardápio no banco de dados...</p>}
        {error && <p className="text-center py-10 text-red-500">Erro ao carregar o menu: {error.message}</p>}

        {data?.categorias && data.categorias.length > 0 ? (
          <div className="space-y-10">
            {data.categorias.map(categoria => (
              <div key={categoria.id}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{categoria.nome}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoria.produtos && categoria.produtos.map(produto => (
                    <div
                      key={produto.id}
                      className="glass-card p-4 flex flex-col group hover:border-brandRed/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900">{produto.nome}</h4>
                        <span className="font-medium text-green-700">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 flex-1">{produto.descricao}</p>

                      <button
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="mt-auto py-2 px-4 rounded border border-gray-200 text-brandRed font-medium hover:bg-red-50 transition"
                      >
                        + Adicionar
                      </button>
                    </div>
                  ))}
                  {(!categoria.produtos || categoria.produtos.length === 0) && (
                    <p className="text-gray-400 italic">Nenhum produto nesta categoria.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500 text-center bg-gray-50 py-12 rounded-xl">O cardápio está vazio ou em atualização.</p>
        )}
      </div>

      {/* 2. visualizacao do carrinho */}
      <div className="w-full lg:w-96">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Seu Pedido</h3>

          {carrinho.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <span className="text-4xl block mb-2">🛒</span>
              <p>Adicione itens do cardápio</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {carrinho.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-gray-800 text-sm">{item.nome}</p>
                    <p className="text-green-700 text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}</p>
                  </div>
                  <button
                    onClick={() => removerDoCarrinho(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Seletor de Método de Pagamento */}
          {carrinho.length > 0 && (
            <div className="border-t pt-4 mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PIX', label: '📱 Pix', desc: 'Imediato' },
                  { id: 'CARTAO', label: '💳 Cartão', desc: 'Crédito' },
                  { id: 'STRIPE', label: '💵 Stripe', desc: 'Simulação' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMetodoPagamento(item.id);
                      setPaymentError(null);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      metodoPagamento === item.id
                        ? 'border-brandRed bg-red-50/50 text-brandRed font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[9px] text-gray-400 font-normal mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {paymentError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-xs mb-4 flex items-start gap-2 animate-pulse-fast">
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-bold">Pagamento recusado!</p>
                <p className="text-gray-500 mt-0.5">{paymentError}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-600">Total:</span>
              <span className="font-bold text-2xl text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
              </span>
            </div>

            <button
              onClick={handleComprar}
              disabled={creatingOrder || loading || carrinho.length === 0 || !userLocation.lat}
              className="btn btn-primary w-full py-4 text-lg font-bold shadow-brandRed/20 shadow-lg disabled:bg-gray-300 disabled:shadow-none disabled:text-gray-500"
            >
              {creatingOrder ? 'Carregando...' : (carrinho.length === 0 ? 'Carrinho Vazio' : (!userLocation.lat ? 'Defina seu Endereço' : 'Finalizar Pedido'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
