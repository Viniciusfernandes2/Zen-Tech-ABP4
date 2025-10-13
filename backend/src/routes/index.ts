import { Router } from 'express';
import cors from 'cors';
import { supabaseAdmin } from '../lib/supabase';
import { criarCuidador } from '../controllers/usuarios.controller';
import { criarAssistido, listarAssistidosDoCuidador, buscarAssistido, meusAssistidos } from '../controllers/assistidos.controller';
import { vincularCuidadorIdoso } from '../controllers/vinculos.controller';
import { requireSupabaseUser } from '../middlewares/auth';

const router = Router();
router.use(cors({ origin: true }));

// rota de saúde - só pra testar se o servidor responde
router.get('/health', (_, res) => res.json({ ok: true, name: 'Bio Alert API' }));

// rota pra testar se o banco está conectado
router.get('/debug/db', async (_req, res) => {
  const { error } = await supabaseAdmin.from('usuarios').select('id').limit(1);
  if (error) return res.status(500).json({ ok:false, db:false, error: error.message });
  return res.json({ ok: true, db: true });
});

// CRUD / fluxo principal
router.post('/cuidadores', criarCuidador);
router.post('/assistidos', criarAssistido);
router.post('/vinculos', vincularCuidadorIdoso);

router.get('/assistidos', listarAssistidosDoCuidador);
router.get('/assistidos/:id', buscarAssistido);

// rota autenticada (precisa do JWT de login)
router.get('/meus-assistidos', requireSupabaseUser, meusAssistidos);

export default router;

