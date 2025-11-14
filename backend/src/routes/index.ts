import { Router } from 'express';
import cors from 'cors';
import { supabaseAdmin } from '../lib/supabase';
import { deviceAuth } from '../middlewares/deviceAuth';
import { requireSupabaseUser } from '../middlewares/auth';

// Controllers
import { loginUsuario } from '../controllers/login.controller';

import {
  getMeuPerfil,
  atualizarMeuPerfil,
  deletarMinhaConta
} from '../controllers/usuarios.controller';

import {
  criarAssistido,
  meusAssistidos,
  buscarAssistido
} from '../controllers/assistidos.controller';

import {
  vincularCuidadorIdoso,
  desvincularCuidador
} from '../controllers/vinculos.controller';

import {
  registrarDispositivo,
  parearDispositivo,
  registrarEventoDispositivo,
  heartbeatDispositivo
} from '../controllers/dipositivo.Controller';

const router = Router();
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
    return res.status(500).json({ ok: false, db: false, error: error.message });
  }
  return res.json({ ok: true, db: true });
});

// 🔐 Auth
router.post('/login', loginUsuario);

// 👤 Rotas do usuário autenticado
router.get('/usuarios/me', requireSupabaseUser, getMeuPerfil);
router.patch('/usuarios/me', requireSupabaseUser, atualizarMeuPerfil);
router.delete('/usuarios/me', requireSupabaseUser, deletarMinhaConta);

// 👥 Assistidos
router.post('/assistidos', requireSupabaseUser, criarAssistido);
router.get('/assistidos/meus', requireSupabaseUser, meusAssistidos);
router.get('/assistidos/:id', requireSupabaseUser, buscarAssistido);

// 🔗 Vínculos (compartilhamento e desvincular)
router.post('/vinculos', requireSupabaseUser, vincularCuidadorIdoso);
router.delete('/vinculos/:assistido_id', requireSupabaseUser, desvincularCuidador);

// ⚙️ Rotas do dispositivo (ESP32)
router.post('/device/register', registrarDispositivo); // primeiro contato da ESP
router.post('/device/pair', requireSupabaseUser, parearDispositivo); // app vincula device ao assistido
router.post('/device/event', deviceAuth, registrarEventoDispositivo); // queda
router.post('/device/heartbeat', deviceAuth, heartbeatDispositivo);   // ping

export default router;
