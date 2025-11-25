import { Router } from 'express';
import cors from 'cors';
import { supabaseAdmin } from '../lib/supabase';

import { deviceAuth } from '../middlewares/deviceAuth';
import { requireSupabaseUser } from '../middlewares/auth';

// Controllers — Auth
import { loginUsuario } from '../controllers/login.controller';
import { registerUsuario } from '../controllers/register.controller';

// Controllers — Usuarios
import {
  getMeuPerfil,
  atualizarMeuPerfil,
  deletarMinhaConta
} from '../controllers/usuarios.controller';

// Controllers — Assistidos
import {
  criarAssistido,
  meusAssistidos,
  buscarAssistido
} from '../controllers/assistidos.controller';

// Controllers — Vínculos
import {
  vincularCuidadorIdoso,
  desvincularCuidador
} from '../controllers/vinculos.controller';

// Controllers — Dispositivo (ESP32)
import {
  registrarDispositivo,
  parearDispositivo,
  registrarEventoDispositivo,
  heartbeatDispositivo,
  listarQuedasAssistido,
  deviceStatus,
  unpairDevice,
  getDeviceByAssistido
} from '../controllers/dipositivo.Controller';

// Controller — Push Token
import { salvarExpoPushToken } from '../controllers/pushToken.controller';

const router = Router();

// === Config Geral ===
router.use(cors({ origin: true }));

// 🩺 Health check
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'Bio Alert API',
    timestamp: new Date().toISOString()
  });
});

// 🧠 Database debug
router.get('/debug/db', async (_req, res) => {
  const { error } = await supabaseAdmin.from('usuarios').select('id').limit(1);
  if (error) {
    return res.status(500).json({
      ok: false,
      db: false,
      error: error.message
    });
  }
  return res.json({ ok: true, db: true });
});

// === Auth ===
router.post('/register', registerUsuario);
router.post('/login', loginUsuario);

// === Usuário autenticado ===
router.get('/usuarios/me', requireSupabaseUser, getMeuPerfil);
router.patch('/usuarios/me', requireSupabaseUser, atualizarMeuPerfil);
router.delete('/usuarios/me', requireSupabaseUser, deletarMinhaConta);

// ⭐ Push Token
router.post('/usuarios/push-token', requireSupabaseUser, salvarExpoPushToken);

// === Assistidos ===
router.post('/assistidos', requireSupabaseUser, criarAssistido);
router.get('/assistidos/meus', requireSupabaseUser, meusAssistidos);
router.get('/assistidos/:id', requireSupabaseUser, buscarAssistido);

// === Vínculos Cuidador ↔ Assistido ===
router.post('/vinculos', requireSupabaseUser, vincularCuidadorIdoso);
router.delete('/vinculos/:assistido_id', requireSupabaseUser, desvincularCuidador);

// === Dispositivo (ESP32) ===
router.post('/device/register', registrarDispositivo);
router.post('/device/pair', requireSupabaseUser, parearDispositivo);
router.post('/device/event', deviceAuth, registrarEventoDispositivo);
router.post('/device/heartbeat', deviceAuth, heartbeatDispositivo);
router.get('/device/status', deviceAuth, deviceStatus);
router.post('/device/unpair', requireSupabaseUser, unpairDevice);

// ⭐ ROTA NOVA (ESSENCIAL PARA O FRONT)
router.get('/device/by-assistido/:id', requireSupabaseUser, getDeviceByAssistido);

// Histórico de quedas
router.get('/assistidos/:id/quedas', requireSupabaseUser, listarQuedasAssistido);

export default router;
