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
 * Valida o token JWT do Supabase, carrega o usuário,
 * cria automaticamente o registro interno em "usuarios" se não existir
 * e popula req.usuarioId para uso em todo o sistema.
 */
export async function requireSupabaseUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // -----------------------------------------
    // 1. Capturar e validar token
    // -----------------------------------------
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return res.status(401).json({ erro: 'Token ausente (Authorization: Bearer <token>)' });
    }

    // Validar token no Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    const supabaseUserId = data.user.id;
    const supabaseUserEmail = data.user.email ?? null;

    req.supabaseUserId = supabaseUserId;
    req.supabaseUserEmail = supabaseUserEmail;

    // -----------------------------------------
    // 2. Encontrar usuário interno no sistema
    // -----------------------------------------
    const { data: usuarioExistente, error: buscaErr } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', supabaseUserId)
      .single();

    // Se usuário interno existente → segue
    if (usuarioExistente && !buscaErr) {
      req.usuarioId = usuarioExistente.id;
      return next();
    }

    // -----------------------------------------
    // 3. Criar automaticamente o usuário interno (AUTO-CREATE)
    // -----------------------------------------
    const novoUsuarioPayload: any = {
      auth_user_id: supabaseUserId,
      email: supabaseUserEmail,
    };

    // Nome do Supabase (se existir)
    if (data.user.user_metadata?.full_name) {
      novoUsuarioPayload.nome_completo = data.user.user_metadata.full_name;
    }

    // Criar usuário local
    const { data: inserido, error: insErr } = await supabaseAdmin
      .from('usuarios')
      .insert(novoUsuarioPayload)
      .select('id')
      .single();

    if (insErr || !inserido) {
      return res.status(500).json({
        erro: 'Falha ao criar perfil interno do usuário',
        detalhe: insErr?.message,
      });
    }

    req.usuarioId = inserido.id;

    // -----------------------------------------
    // 4. Continuar fluxo
    // -----------------------------------------
    return next();
  } catch (e: any) {
    return res
      .status(401)
      .json({ erro: 'Falha na autenticação', detalhe: e?.message });
  }
}
