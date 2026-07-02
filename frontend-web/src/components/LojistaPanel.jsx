import React, { useState, useEffect } from 'react';
import { GET_RESTAURANTES, OBTER_INSIGHTS_LOJA, ATUALIZAR_ASSINATURA } from '../graphql/queries';
import { API_URL } from '../config';

export default function LojistaPanel() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState('');
  const [insights, setInsights] = useState(null);
  const [loadingRestaurantes, setLoadingRestaurantes] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [updatingSubscription, setUpdatingSubscription] = useState(false);
  const [error, setError] = useState(null);

  // 1. Carrega os restaurantes cadastrados no sistema
  useEffect(() => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_RESTAURANTES })
    })
      .then(r => r.json())
      .then(res => {
        if (res.errors) throw new Error(res.errors[0].message);
        const list = res.data.restaurantes || [];
        setRestaurantes(list);
        if (list.length > 0) {
          setSelectedRestauranteId(list[0].id);
        }
        setLoadingRestaurantes(false);
      })
      .catch(err => {
        console.error(err);
        setError('Falha ao carregar a lista de restaurantes.');
        setLoadingRestaurantes(false);
      });
  }, []);

  // 2. Busca insights toda vez que mudar o restaurante selecionado
  const fetchInsights = (restauranteId) => {
    if (!restauranteId) return;
    setLoadingInsights(true);
    setError(null);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: OBTER_INSIGHTS_LOJA,
        variables: { restauranteId: parseInt(restauranteId) }
      })
    })
      .then(r => r.json())
      .then(res => {
        if (res.errors) throw new Error(res.errors[0].message);
        setInsights(res.data.obterInsightsLoja);
        setLoadingInsights(false);
      })
      .catch(err => {
        console.error(err);
        setError('Falha ao buscar os insights do microsserviço de recomendação.');
        setLoadingInsights(false);
      });
  };

  useEffect(() => {
    if (selectedRestauranteId) {
      fetchInsights(selectedRestauranteId);
    }
  }, [selectedRestauranteId]);

  // 3. Altera a assinatura do restaurante
  const handleAtualizarAssinatura = async (novoPlano) => {
    if (!selectedRestauranteId) return;
    setUpdatingSubscription(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ATUALIZAR_ASSINATURA,
          variables: {
            restauranteId: parseInt(selectedRestauranteId),
            plano: novoPlano
          }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      
      // Atualiza os dados recarregando do gRPC
      fetchInsights(selectedRestauranteId);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar plano de assinatura.');
    } finally {
      setUpdatingSubscription(false);
    }
  };

  const getSuggestionBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'BAIXAR_PRECO_COMPETITIVO':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'MANTER_PRECO_PROMO':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'PROMOÇÃO_LOCAL':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getSuggestionBadgeText = (tipo) => {
    switch (tipo) {
      case 'BAIXAR_PRECO_COMPETITIVO':
        return 'Preço Desalinhado';
      case 'MANTER_PRECO_PROMO':
        return 'Preço Competitivo';
      case 'PROMOÇÃO_LOCAL':
        return 'Oportunidade Local';
      default:
        return 'Recomendação';
    }
  };

  if (loadingRestaurantes) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-brandRed border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Buscando lojas associadas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Lojista</h1>
          <p className="text-gray-500">Monitore preços, concorrência e receba sugestões inteligentes baseadas em CDC e gRPC.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="text-sm font-bold text-gray-600 whitespace-nowrap">Restaurante Ativo:</label>
          <select
            value={selectedRestauranteId}
            onChange={(e) => setSelectedRestauranteId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brandRed/20"
          >
            {restaurantes.map(r => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 text-sm mb-6 flex items-center gap-3">
          <span>⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loadingInsights ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-brandRed border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Consultando gRPC recomendacao-py...</p>
        </div>
      ) : insights ? (
        <div>
          {/* Card de Informações da Assinatura / Plano */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                {insights.plano === 'PREMIUM' ? '🌟' : '🛡️'}
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Plano Atual</p>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Plano {insights.plano}
                  <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold border ${
                    insights.plano === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {insights.plano}
                  </span>
                </h3>
              </div>
            </div>
            <div>
              {insights.plano === 'GRATUITO' ? (
                <button
                  disabled={updatingSubscription}
                  onClick={() => handleAtualizarAssinatura('PREMIUM')}
                  className="btn btn-primary px-6 py-3 font-bold shadow-lg shadow-red-500/20 active:scale-95"
                >
                  {updatingSubscription ? 'Assinando...' : '🚀 Ativar Plano Premium (gRPC)'}
                </button>
              ) : (
                <button
                  disabled={updatingSubscription}
                  onClick={() => handleAtualizarAssinatura('GRATUITO')}
                  className="btn btn-secondary px-4 py-2.5 text-xs text-gray-500"
                >
                  {updatingSubscription ? 'Cancelando...' : 'Rebaixar para Plano Gratuito'}
                </button>
              )}
            </div>
          </div>

          {/* Renderização condicional dependendo do plano de insights */}
          {insights.plano === 'GRATUITO' ? (
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-800 shadow-xl shadow-slate-900/10">
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
              <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

              <div className="max-w-2xl relative z-10">
                <span className="text-xs font-bold text-brandRed uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  Exclusivo Premium
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mt-6 mb-4 tracking-tight leading-tight">
                  Previsão de Preços & Análise da Concorrência em Tempo Real
                </h2>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
                  Desbloqueie o acesso a algoritmos inteligentes de precificação dinâmica. O microsserviço analítico de Python escuta mudanças via CDC (Kafka) nas lojas parceiras, compara e sugere descontos baseados no horário de pico local e na distância geográfica.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { title: 'Concorrência', desc: 'Distâncias geográficas via Haversine' },
                    { title: 'Dinâmica', desc: 'Preços baseados no pico do concorrente' },
                    { title: 'Recomendação', desc: 'Sincronização instantânea via CDC' }
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="font-bold text-white mb-1">{feat.title}</p>
                      <p className="text-xs text-slate-400">{feat.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  disabled={updatingSubscription}
                  onClick={() => handleAtualizarAssinatura('PREMIUM')}
                  className="btn btn-primary px-8 py-4 text-base font-bold shadow-xl shadow-red-500/25"
                >
                  {updatingSubscription ? 'Processando...' : 'Liberar Painel de Inteligência Agora'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Informações Gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Área Geográfica Analisada</p>
                  <h4 className="text-3xl font-extrabold text-gray-800">Raio de 5.0 km</h4>
                  <p className="text-sm text-gray-500 mt-2">Buscando concorrência ativa nas coordenadas geográficas cadastradas.</p>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Competidores Próximos</p>
                  <h4 className="text-3xl font-extrabold text-blue-600">
                    {insights.concorrentesAnalisados}{' '}
                    <span className="text-sm text-gray-500 font-normal">
                      {insights.concorrentesAnalisados === 1 ? 'loja concorrente' : 'lojas concorrentes'}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">Número de marcas na mesma região identificadas no banco analítico de recomendações.</p>
                </div>
              </div>

              {/* Tabela/Grid de Insights de Produtos */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Sugestões de Produtos e Precificação</h3>
                {insights.insights && insights.insights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insights.insights.map((insight, idx) => (
                      <div key={idx} className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-brandRed">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg leading-tight">{insight.produtoNome}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">ID do Produto: #{insight.produtoId}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${getSuggestionBadgeStyle(insight.tipoSugestao)}`}>
                              {getSuggestionBadgeText(insight.tipoSugestao)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-100 leading-relaxed">
                            {insight.sugestao}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Preço Base Atual:</span>
                          <span className="font-extrabold text-slate-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insight.precoAtual)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center bg-gray-50 py-12 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 font-medium">Nenhum produto cadastrado para gerar insights neste restaurante.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Nenhum dado retornado. Certifique-se de que o restaurante possui produtos.
        </div>
      )}
    </div>
  );
}
