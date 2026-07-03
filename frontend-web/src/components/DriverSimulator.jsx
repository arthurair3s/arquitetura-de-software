import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ACOMPANHAR_PEDIDO, ATUALIZAR_STATUS_ENTREGA, MOVER_ENTREGADOR } from '../graphql/queries';
import { Bike, Navigation2, CheckCircle } from 'lucide-react';

export default function DriverSimulator({ activePedidoId }) {
  const [mover] = useMutation(MOVER_ENTREGADOR);
  const [atualizarStatus] = useMutation(ATUALIZAR_STATUS_ENTREGA);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const { data } = useQuery(ACOMPANHAR_PEDIDO, {
    variables: { id: activePedidoId },
    skip: !activePedidoId,
    pollInterval: 3000
  });

  const entrega = data?.pedido?.entregas?.[0];
  const moto = entrega?.entregador;

  // Controles de Mock
  const [movStep, setMovStep] = useState(1);

  const mockAndar = async () => {
    if (!moto) return;
    
    // Coordenadas base do Pedro (ID 3): -22.8950, -43.2000
    // Vamos subtrair para aproximá-lo do Centro RJ
    const stepMove = 0.0020 * movStep; 
    const novaLat = -22.8950 - (stepMove * 0.5); // move pouco na lat
    const novaLon = -43.2000 + stepMove;         // move para direita

    try {
      await mover({
        variables: {
          id: moto.id,
          latitude: novaLat,
          longitude: novaLon
        }
      });
      setMovStep(s => s + 1);
    } catch(e) {
      console.error('Erro de GPS mock', e);
    }
  };

  const handleMudarStatus = async (novoStatus) => {
    if (!entrega || loadingStatus) return;
    setLoadingStatus(true);
    try {
      await atualizarStatus({ 
        variables: { id: entrega.id, status: novoStatus },
        refetchQueries: [{ query: ACOMPANHAR_PEDIDO, variables: { id: activePedidoId } }]
      });
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  if (!activePedidoId) {
    return (
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">Aguardando o cliente realizar um pedido...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ border: '1px solid rgba(56, 189, 248, 0.2)' }}>
      <div className="panel-header" style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
        <h2 className="panel-title text-accent">
          <Bike /> 
          App do Entregador 
        </h2>
      </div>

      <div className="panel-content">
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <p className="text-secondary mb-1">Entregador Designado</p>
              <h3 className="card-title text-primary" style={{ fontSize: '1.4rem' }}>{moto?.nome || '...'}</h3>
            </div>
            {moto && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div className="pulsing-dot"></div>
                 <span className="text-accent font-semibold">ONLINE</span>
               </div>
            )}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <p className="text-muted mb-2">Status da Entrega</p>
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>
              {entrega?.status || 'Aguardando'}
            </h4>
          </div>

          <p className="text-secondary mb-4">Ações Rápidas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={mockAndar}
            >
              <Navigation2 size={18} /> Simular Movimento do GPS (Ir +Frente)
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button 
                className={`btn ${entrega?.status === 'ATRIBUIDA' ? 'btn-success' : ''}`}
                onClick={() => handleMudarStatus('EM_TRANSITO')}
                disabled={entrega?.status !== 'ATRIBUIDA' || loadingStatus}
              >
                {loadingStatus && entrega?.status === 'ATRIBUIDA' ? 'Processando...' : 'Peguei o Lanche'}
              </button>
              
              <button 
                className={`btn ${entrega?.status === 'EM_TRANSITO' ? 'btn-success' : ''}`}
                onClick={() => handleMudarStatus('ENTREGUE')}
                disabled={entrega?.status !== 'EM_TRANSITO' || loadingStatus}
              >
                <CheckCircle size={18} /> {loadingStatus && entrega?.status === 'EM_TRANSITO' ? 'Finalizando...' : 'Finalizar Entrega'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
