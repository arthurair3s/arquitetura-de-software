import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  GET_ENTREGAS_PENDENTES,
  GET_ENTREGADOR_ENTREGAS,
  ACEITAR_ENTREGA,
  ATUALIZAR_STATUS_ENTREGADOR,
  SIMULAR_DESLOCAMENTO,
  ATUALIZAR_STATUS_ENTREGA,
  ATUALIZAR_LOCALIZACAO_ENTREGADOR
} from '../graphql/queries';
import { API_URL } from '../config';

// Correção de ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png', // Moto / Scooter Icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={driverIcon}
      ref={markerRef}
    />
  );
}

const PRESETS = [
  { nome: 'Centro (RJ)', lat: -22.9035, lon: -43.1730 },
  { nome: 'Cachambi (Pizzaria)', lat: -22.8861, lon: -43.2778 },
  { nome: 'Maria da Graça (Sushi)', lat: -22.8767, lon: -43.2721 },
  { nome: 'Bonsucesso (Lanche)', lat: -22.8631, lon: -43.2554 },
  { nome: 'Copacabana (Seafood)', lat: -22.9711, lon: -43.1822 },
];

export default function EntregadorPanel({ usuario }) {
  const [statusEntregador, setStatusEntregador] = useState('OFFLINE');
  const [entregasPendentes, setEntregasPendentes] = useState([]);
  const [entregasProprias, setEntregasProprias] = useState([]);
  const [activeEntrega, setActiveEntrega] = useState(null);
  
  const [coords, setCoords] = useState([-22.9068, -43.1729]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [loadingActive, setLoadingActive] = useState(false);
  const [simulando, setSimulando] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const entregadorId = usuario?.entregador_id;


  // 1. Busca status e entregas do próprio entregador
  const fetchEntregadorDados = async () => {
    if (!entregadorId) return;
    setLoadingActive(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_ENTREGADOR_ENTREGAS,
          variables: { id: String(entregadorId) }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      
      const motorista = res.data.entregador;
      if (motorista) {
        setStatusEntregador(motorista.status || 'OFFLINE');
        const list = motorista.entregas || [];
        setEntregasProprias(list);
        
        if (motorista.latitude && motorista.longitude) {
          setCoords([motorista.latitude, motorista.longitude]);
        }
        
        // Encontra uma entrega ativa (status diferente de ENTREGUE)
        const ativa = list.find(e => e.status !== 'ENTREGUE');
        setActiveEntrega(ativa || null);
      }
    } catch (e) {
      console.error(e);
      setError('Erro ao carregar dados do entregador.');
    } finally {
      setLoadingActive(false);
    }
  };

  // Atualizar localização manualmente via GraphQL
  const handleUpdateLocation = async (lat, lon) => {
    if (!entregadorId) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ATUALIZAR_LOCALIZACAO_ENTREGADOR,
          variables: { id: String(entregadorId), latitude: Number(lat), longitude: Number(lon) }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      setCoords([lat, lon]);
      showSuccess(`Localização atualizada para: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      fetchEntregadorDados();
    } catch (e) {
      showError(e.message || 'Erro ao atualizar localização.');
    }
  };


  // 2. Busca entregas pendentes no radar
  const fetchPendentes = async () => {
    if (statusEntregador === 'OFFLINE') return;
    setLoadingRadar(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_ENTREGAS_PENDENTES })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      setEntregasPendentes(res.data.entregasPendentes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    fetchEntregadorDados();
  }, [entregadorId]);

  // Polling para o Radar de entregas pendentes
  useEffect(() => {
    if (statusEntregador !== 'OFFLINE' && !activeEntrega) {
      fetchPendentes();
      const interval = setInterval(fetchPendentes, 5000);
      return () => clearInterval(interval);
    } else {
      setEntregasPendentes([]);
    }
  }, [statusEntregador, activeEntrega]);

  // Polling para acompanhar entrega ativa em progresso
  useEffect(() => {
    if (activeEntrega) {
      const interval = setInterval(fetchEntregadorDados, 3000);
      return () => clearInterval(interval);
    }
  }, [activeEntrega]);

  // Alternar disponibilidade
  const handleToggleDisponibilidade = async () => {
    if (!entregadorId) return;
    setError(null);
    const novoStatus = statusEntregador === 'OFFLINE' ? 'DISPONIVEL' : 'OFFLINE';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ATUALIZAR_STATUS_ENTREGADOR,
          variables: { id: String(entregadorId), novoStatus }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      setStatusEntregador(res.data.atualizarStatusEntregador.status);
      showSuccess(`Você está agora ${novoStatus === 'DISPONIVEL' ? 'Disponível' : 'Offline'}!`);
      
      if (novoStatus === 'DISPONIVEL') {
        fetchPendentes();
      }
    } catch (e) {
      showError(e.message || 'Erro ao alterar status.');
    }
  };

  // Aceitar entrega do radar
  const handleAceitarEntrega = async (entregaId) => {
    if (!entregadorId) return;
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ACEITAR_ENTREGA,
          variables: { entrega_id: entregaId, entregador_id: String(entregadorId) }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      showSuccess('Entrega aceita com sucesso! Rota vinculada.');
      fetchEntregadorDados();
    } catch (e) {
      showError(e.message || 'Erro ao aceitar entrega.');
    }
  };

  // Disparar simulador do servidor
  const handleSimularDeslocamento = async () => {
    if (!activeEntrega) return;
    setSimulando(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: SIMULAR_DESLOCAMENTO,
          variables: { id: String(activeEntrega.id) }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      showSuccess('Simulação iniciada em segundo plano! Acompanhe o progresso.');
    } catch (e) {
      showError(e.message || 'Erro ao iniciar simulação.');
    } finally {
      setSimulando(false);
    }
  };

  // Manualmente mudar status de entrega ativa
  const handleAtualizarStatusEntrega = async (novoStatus) => {
    if (!activeEntrega) return;
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ATUALIZAR_STATUS_ENTREGA,
          variables: { id: String(activeEntrega.id), status: novoStatus }
        })
      }).then(r => r.json());

      if (res.errors) throw new Error(res.errors[0].message);
      showSuccess(`Status da entrega alterado para ${novoStatus}`);
      fetchEntregadorDados();
    } catch (e) {
      showError(e.message || 'Erro ao mudar status.');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  if (!entregadorId) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-gray-800 mt-4">Perfil não associado</h3>
        <p className="text-gray-400 text-sm mt-2">
          Sua conta de entregador não possui um cadastro gRPC válido no microsserviço C#.
          Tente fazer login novamente para disparar o auto-registro.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>🛵</span> App do Entregador
          </h1>
          <p className="text-gray-500 mt-1">Gerencie sua disponibilidade, aceite pedidos e faça simulação de entregas.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full ${statusEntregador !== 'OFFLINE' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="font-bold text-sm text-gray-700 uppercase">{statusEntregador}</span>
          </div>
          <button
            onClick={handleToggleDisponibilidade}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
              statusEntregador === 'OFFLINE'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
            }`}
          >
            {statusEntregador === 'OFFLINE' ? 'Ficar Online' : 'Ficar Offline'}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 text-sm mb-6 flex items-center gap-3">
          <span>⚠️</span>
          <p className="font-semibold">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-green-600 text-sm mb-6 flex items-center gap-3">
          <span>✔</span>
          <p className="font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Entrega Ativa ou Radar */}
        <div className="lg:col-span-2 space-y-6">
          {activeEntrega ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b pb-4 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-brandRed uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                    Entrega em Andamento
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-800 mt-3">Corrida #{activeEntrega.id}</h2>
                  <p className="text-sm text-gray-400 mt-1">Pedido ID: #{activeEntrega.pedido?.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Status Atual</p>
                  <span className="text-lg font-extrabold text-indigo-600 uppercase tracking-wider">
                    {activeEntrega.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Destinatário</h4>
                  <p className="font-bold text-gray-800">{activeEntrega.pedido?.usuario?.nome}</p>
                  <p className="text-sm text-gray-500 mt-1">{activeEntrega.pedido?.usuario?.endereco}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ganhos Estimados</h4>
                  <p className="text-2xl font-extrabold text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeEntrega.pedido?.valor_total)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Central de Roteamento & Simulação</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSimularDeslocamento}
                    disabled={simulando}
                    className="flex-1 px-6 py-4 bg-brandRed hover:bg-brandRed-dark text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition active:scale-95 disabled:opacity-50"
                  >
                    {simulando ? 'Iniciando Rota...' : '🚀 Simular Rota pelo GPS (Autônomo)'}
                  </button>
                </div>

                <div className="border-t pt-4 flex justify-between items-center gap-4 flex-wrap">
                  <p className="text-xs text-gray-400 font-bold">Overrides Manuais:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAtualizarStatusEntrega('EM_TRANSITO')}
                      disabled={activeEntrega.status !== 'ATRIBUIDA'}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      Peguei o Pedido
                    </button>
                    <button
                      onClick={() => handleAtualizarStatusEntrega('ENTREGUE')}
                      disabled={activeEntrega.status !== 'EM_TRANSITO'}
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      Finalizar Entrega
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SE NÃO HOUVER ENTREGA ATIVA (MOSTRA RADAR) */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brandRed animate-ping"></span>
                  Radar de Entregas Pendentes
                </h2>
                <button
                  onClick={fetchPendentes}
                  disabled={statusEntregador === 'OFFLINE'}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-medium disabled:opacity-50"
                >
                  🔄 Atualizar
                </button>
              </div>

              {statusEntregador === 'OFFLINE' ? (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8">
                  <span className="text-4xl">😴</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-4">Você está offline</h3>
                  <p className="text-gray-400 text-sm mt-1">Fique online para começar a receber ofertas de corridas próximas.</p>
                </div>
              ) : loadingRadar ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-brandRed border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-gray-500 text-sm">Escaneando arredores...</p>
                </div>
              ) : entregasPendentes.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8">
                  <span className="text-4xl">🛰️</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-4">Procurando entregas...</h3>
                  <p className="text-gray-400 text-sm mt-1">Nenhuma corrida pendente na sua região no momento. Ajuste sua localização no mapa se necessário.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {entregasPendentes.map(e => (
                    <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-200 transition-all">
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-lg">Corrida #{e.id}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Destino: <span className="font-bold text-gray-700">{e.pedido?.usuario?.nome}</span> ({e.pedido?.usuario?.endereco})
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Ganhos</p>
                          <p className="text-lg font-extrabold text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.pedido?.valor_total)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAceitarEntrega(e.id)}
                          className="px-6 py-3 bg-brandRed hover:bg-brandRed-dark text-white rounded-xl font-bold text-sm shadow-md transition active:scale-95"
                        >
                          🤝 Aceitar Corrida
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lado Direito: Simulador de Localização */}
        <div>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 sticky top-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-1.5">
                <span>📍</span> Posição de Simulação
              </h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Arraste o pin no mapa abaixo ou use os botões rápidos para mudar sua posição geográfica no gRPC (Redis). Isso altera as corridas visíveis no radar.
            </p>

            {/* Presets de localização rápida */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Teletransporte Rápido:</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUpdateLocation(p.lat, p.lon)}
                    className="px-2.5 py-2 bg-slate-50 hover:bg-red-50 hover:text-brandRed border border-slate-100 hover:border-brandRed/20 rounded-xl text-[10px] font-bold text-gray-700 transition-all text-left truncate"
                    title={p.nome}
                  >
                    📍 {p.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Mapa de Localização */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Ajuste Fino no Mapa:</label>
              <div className="h-56 w-full rounded-2xl border border-slate-100 overflow-hidden relative shadow-inner">
                <MapContainer 
                  center={coords} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <DraggableMarker 
                    position={coords} 
                    setPosition={(newPos) => handleUpdateLocation(newPos[0], newPos[1])} 
                  />
                  <RecenterMap position={coords} />
                </MapContainer>
                <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-slate-900/90 text-white text-[9px] font-semibold py-1 px-2.5 rounded-full shadow backdrop-blur-sm pointer-events-none">
                  Drag 📍 to update position
                </div>
              </div>
            </div>

            <div className="pt-2 border-t flex justify-between items-center text-[10px] text-gray-500 font-bold">
              <span>Latitude: {coords[0].toFixed(5)}</span>
              <span>Longitude: {coords[1].toFixed(5)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
