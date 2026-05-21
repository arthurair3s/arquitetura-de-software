import axios from 'axios';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

export const obterCoordenadas = async (endereco: string): Promise<Coordenadas | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`;

    const response = await axios.get<NominatimResponse[]>(url, {
      headers: {
        'User-Agent': 'SistemaGeocodificacaoNode/1.0 (arthuraires0@gmail.com)',
        'Accept-Language': 'pt-BR'
      }
    });

    const data = response.data;

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    throw new Error('Endereço não encontrado');
  } catch (error: any) {
    console.error('Erro de geocodificação: ', error.message);
    return null;
  }
};
