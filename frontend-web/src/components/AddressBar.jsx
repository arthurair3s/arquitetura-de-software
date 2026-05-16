import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapPin, Edit3, Check, X, Navigation, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ATUALIZAR_ENDERECO, ME } from '../graphql/queries';
import { API_URL } from '../config';

// Correção de ícones padrão do leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const clienteIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
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
      icon={clienteIcon}
      ref={markerRef}
    />
  );
}

export default function AddressBar({ usuario, setUsuario }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [endereco, setEndereco] = useState(usuario?.endereco || '');
  const [tempCoords, setTempCoords] = useState(
    usuario?.latitude && usuario?.longitude 
      ? [Number(usuario.latitude), Number(usuario.longitude)] 
      : [-22.9068, -43.1729]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEndereco(usuario?.endereco || '');
    if (usuario?.latitude && usuario?.longitude) {
      setTempCoords([Number(usuario.latitude), Number(usuario.longitude)]);
    }
  }, [usuario]);

  const handleSave = async (lat, lon, addr) => {
    setLoading(true);
    let finalLat = lat || tempCoords[0];
    let finalLon = lon || tempCoords[1];

    // Se as coordenadas forem as padrão e o endereço mudou, tenta geocoding
    if ((!lat || !lon) && addr !== usuario?.endereco) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLon = parseFloat(data[0].lon);
          setTempCoords([finalLat, finalLon]);
        }
      } catch (e) {
        console.error("Erro no Geocoding:", e);
      }
    }

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: ATUALIZAR_ENDERECO,
          variables: {
            latitude: finalLat,
            longitude: finalLon,
            endereco: addr
          }
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      const updatedUserData = result.data.atualizarEndereco;
      const updatedUser = { ...usuario, ...updatedUserData };
      
      setUsuario(updatedUser);
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setIsEditing(false);
      setShowMap(false);
    } catch (err) {
      alert("Erro ao atualizar endereço: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setTempCoords([latitude, longitude]);
          setEndereco(`Meu Local Atual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setLoading(false);
          setShowMap(true);
        },
        (error) => {
          setLoading(false);
          alert("Não foi possível obter sua localização. Use o mapa para ajustar.");
          setShowMap(true);
        },
        { timeout: 5000 }
      );
    }
  };

  const hasAddress = usuario?.latitude && usuario?.longitude;

  return (
    <div className={`w-full mb-6 rounded-2xl border transition-all duration-300 overflow-hidden ${!hasAddress ? 'bg-red-50 border-red-200 shadow-lg' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!hasAddress ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
            <MapPin size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${!hasAddress ? 'text-red-600' : 'text-gray-400'}`}>
              {!hasAddress ? '⚠️ Endereço não definido' : 'Entregar em:'}
            </h4>
            {isEditing ? (
              <div className="flex flex-col gap-2 mt-1">
                <input 
                  type="text" 
                  className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-brandRed outline-none"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro..."
                />
                <div className="flex gap-2">
                  <button onClick={() => useCurrentLocation()} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                    <Navigation size={12} /> Usar GPS
                  </button>
                  <button onClick={() => setShowMap(!showMap)} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${showMap ? 'bg-brandRed text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <MapIcon size={12} /> {showMap ? 'Esconder Mapa' : 'Ajustar no Mapa'}
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm font-semibold truncate ${!hasAddress ? 'text-red-700' : 'text-gray-800'}`}>
                {usuario?.endereco || "Defina seu endereço para ver restaurantes!"}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className={`btn btn-sm flex items-center gap-1 ${!hasAddress ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Edit3 size={14} /> {hasAddress ? 'Alterar' : 'Definir'}
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleSave(null, null, endereco)}
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 shadow-md"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={20} />}
              </button>
              <button 
                onClick={() => { setIsEditing(false); setShowMap(false); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && showMap && (
        <div className="h-64 w-full border-t border-gray-100 animate-fade-in relative">
          <MapContainer center={tempCoords} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <DraggableMarker position={tempCoords} setPosition={setTempCoords} />
            <RecenterMap position={tempCoords} />
          </MapContainer>
          <div className="absolute bottom-2 right-2 z-[1000] bg-white/90 backdrop-blur p-2 rounded-lg text-[10px] shadow-sm pointer-events-none">
            Arraste o pin para o local exato da entrega
          </div>
        </div>
      )}
    </div>
  );
}

