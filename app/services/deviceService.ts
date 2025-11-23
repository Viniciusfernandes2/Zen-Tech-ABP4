// src/services/deviceService.ts
import api from '../api/axios';

/**
 * Parear dispositivo (código curto ou ESP)
 */
export async function parearDevice(payload: {
  codigo_esp?: string;
  codigo_curto?: string;
  assistido_id: string;
  pair_code?: string;
}) {
  const resp = await api.post('/device/pair', payload);
  return resp.data;
}

/**
 * Pegar status do dispositivo (usado pelo ESP32)
 */
export async function deviceStatusApi() {
  const resp = await api.get('/device/status');
  return resp.data;
}

/**
 * Desvincular dispositivo
 */
export async function unpairDeviceApi(codigo_esp: string) {
  const resp = await api.post('/device/unpair', { codigo_esp });
  return resp.data;
}

/**
 * ⭐ NOVO — BUSCAR DISPOSITIVO DE UM ASSISTIDO
 * ESSA FUNÇÃO É A QUE O FRONT-APP REALMENTE PRECISA
 */
export async function getDeviceByAssistido(assistido_id: string) {
  const resp = await api.get(`/device/by-assistido/${assistido_id}`);
  return resp.data?.dispositivo || null;
}
