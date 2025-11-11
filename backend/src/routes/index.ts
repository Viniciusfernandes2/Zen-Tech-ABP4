import { Router } from 'express';
import cors from 'cors';
import { supabaseAdmin } from '../lib/supabase';
import {
  registrarDispositivo,
  vincularDispositivo
} from "../controllers/dipositivo.Controller";


// Controllers
import { loginUsuario } from '../controllers/login.controller';
import { 
  criarUsuario, 
  listarUsuarios, 
  buscarUsuario, 
  atualizarUsuario, 
  deletarUsuario 
} from '../controllers/usuarios.controller';
import { 
  criarAssistido, 
  listarAssistidosDoCuidador, 
  buscarAssistido, 
  meusAssistidos 
} from '../controllers/assistidos.controller';
import { vincularCuidadorIdoso } from '../controllers/vinculos.controller';
import { requireSupabaseUser } from '../middlewares/auth';

const router = Router();
router.use(cors({ origin: true }));

// 🩺 Rota de saúde - testar se o servidor responde
router.get('/health', (_, res) => res.json({ ok: true, name: 'Bio Alert API' }));

// 🧠 Rota pra testar conexão com banco
router.get('/debug/db', async (_req, res) => {
  const { error } = await supabaseAdmin.from('usuarios').select('id').limit(1);
  if (error) return res.status(500).json({ ok: false, db: false, error: error.message });
  return res.json({ ok: true, db: true });
});

// 🔐 Login
router.post('/login', loginUsuario);

// 👤 Rotas de Usuário (CRUD)
router.post('/usuarios', criarUsuario);         // CREATE
router.get('/usuarios', listarUsuarios);        // READ (todos)
router.get('/usuarios/:id', buscarUsuario);     // READ (um)
router.put('/usuarios/:id', atualizarUsuario);  // UPDATE
router.delete('/usuarios/:id', deletarUsuario); // DELETE

// 👥 Rotas de Assistidos
router.post('/assistidos', criarAssistido);
router.get('/assistidos', listarAssistidosDoCuidador);
router.get('/assistidos/:id', buscarAssistido);

// 🔗 Vincular Cuidador e Idoso
router.post('/vinculos', vincularCuidadorIdoso);

// 🔒 Rota autenticada
router.get('/meus-assistidos', requireSupabaseUser, meusAssistidos);

// ⚙️ Rotas do ESP32
router.post("/registrar", registrarDispositivo);
router.post("/vincular", vincularDispositivo);

export default router;


