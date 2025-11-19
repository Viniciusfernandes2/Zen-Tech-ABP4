// src/services/assistidoService.ts
import api from '../api/axios';

export interface AssistidoCreatePayload {
  nome_completo: string;
  data_nascimento: string; // YYYY-MM-DD
  observacoes?: string | null;
  telefone_1?: string | null;
  telefone_2?: string | null;
}

export async function criarAssistidoApi(payload: AssistidoCreatePayload) {
  const resp = await api.post('/assistidos', payload); // backend: POST /api/assistidos
  return resp.data; // { assistido, vinculo } conforme backend
}

export async function meusAssistidosApi() {
  const resp = await api.get('/assistidos/meus'); // GET /api/assistidos/meus
  return resp.data; // { assistidos: [...] }
}

export async function getAssistidoApi(id: string) {
  const resp = await api.get(`/assistidos/${id}`);
  return resp.data; // { assistido }
}
