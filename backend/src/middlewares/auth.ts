import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

declare global {
  namespace Express {
    interface Request {
      supabaseUserId?: string;
      supabaseUserEmail?: string | null;
      usuarioId?: string; // ID da tabela interna "usuarios"
    }
  }
}

/**
 * Middleware de autenticação.
 * - Valida token JWT no Supabase
 * - Carrega o usuário interno (tabela "usuarios")
 * - NÃO cria perfil interno automaticamente (sem auto-create)
 */
export async function requireSupabaseUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1) Captura token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : null;

    if (!token) {
      return res.status(401).json({ erro: 'Token ausente (Authorization: Bearer <token>)' });
    }

    // 2) Valida token no Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    const supabaseUserId = data.user.id;
    const supabaseUserEmail = data.user.email ?? null;

    req.supabaseUserId = supabaseUserId;
    req.supabaseUserEmail = supabaseUserEmail;

    // 3) Buscar usuário interno (não cria automaticamente)
    const { data: usuarioExistente, error: buscaErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, nome_completo, email')
      .eq('auth_user_id', supabaseUserId)
      .maybeSingle();

    if (buscaErr) {
      // erro de DB
      return res.status(500).json({
        erro: 'Erro ao buscar perfil interno',
        detalhe: buscaErr.message
      });
    }

    if (!usuarioExistente) {
      // NÃO criar automaticamente — exigir registro prévio
      return res.status(401).json({
        erro: 'Perfil interno não encontrado. Cadastre-se via /register antes de acessar esta rota.'
      });
    }

    // 4) popula req e segue
    req.usuarioId = usuarioExistente.id;
    return next();
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Falha na autenticação',
      detalhe: e?.message
    });
  }
}
