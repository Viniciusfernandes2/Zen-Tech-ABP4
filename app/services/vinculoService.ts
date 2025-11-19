// src/services/vinculoService.ts
import api from '../api/axios';

export async function vincularPorCodigo(codigo: string) {
  const resp = await api.post('/vinculos', { codigo });
  return resp.data; // { mensagem, assistido, vinculo }
}

export async function desvincular(assistido_id: string) {
  const resp = await api.delete(`/vinculos/${assistido_id}`);
  return resp.data;
}
