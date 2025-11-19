// src/services/historicoService.ts
import api from '../api/axios';

export interface Queda {
  id: number;
  created_at: string;
  event_id?: string;
  source_timestamp?: string;
  event_type?: string;
  eixo_x?: number;
  eixo_y?: number;
  eixo_z?: number;
  totalacc?: number;
  raw_payload?: any;
  dispositivo_id?: string;
}

export async function getHistoricoQuedas(assistidoId: string, page = 1, pageSize = 50) {
  const resp = await api.get(`/assistidos/${assistidoId}/quedas?page=${page}&pageSize=${pageSize}`);
  // backend responde { page, pageSize, items: quedas }
  return resp.data.items ?? resp.data;
}
