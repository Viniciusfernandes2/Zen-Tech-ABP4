// src/services/deviceService.ts
import api from '../api/axios';

export async function parearDevice(codigo_esp: string, assistido_id: string, pair_code?: string) {
  const body: any = { codigo_esp, assistido_id };
  if (pair_code) body.pair_code = pair_code;
  const resp = await api.post('/device/pair', body);
  return resp.data;
}

export async function deviceStatusApi() {
  const resp = await api.get('/device/status');
  return resp.data;
}

export async function unpairDeviceApi(codigo_esp: string) {
  const resp = await api.post('/device/unpair', { codigo_esp });
  return resp.data;
}
