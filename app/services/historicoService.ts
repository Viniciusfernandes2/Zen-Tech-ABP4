import api from "../api/axios";

export interface Queda {
  id: string;
  data: string;
  horario: string;
  x: number;
  y: number;
  z: number;
  total: number;
}

export async function getHistoricoQuedas(): Promise<Queda[]> {
  try {
    const response = await api.get('/queda/historico');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.erro || 'Erro ao buscar histórico de quedas');
    }
    throw new Error('Erro de conexão com o servidor');
  }
}

export async function getUltimaQueda(): Promise<Queda | null> {
  try {
    const response = await api.get('/queda/ultima');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error('Erro ao buscar última queda');
  }
}