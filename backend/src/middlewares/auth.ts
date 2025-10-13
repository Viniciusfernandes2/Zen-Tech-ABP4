import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

declare global {
  namespace Express {
    interface Request {
      supabaseUserId?: string;
      supabaseUserEmail?: string | null;
    }
  }
}

export async function requireSupabaseUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ erro: 'Token ausente (Authorization: Bearer <JWT>)' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ erro: 'Token inválido/expirado' });

    req.supabaseUserId = data.user.id;
    req.supabaseUserEmail = data.user.email ?? null;
    return next();
  } catch (e: any) {
    return res.status(401).json({ erro: 'Não autorizado', detalhe: e?.message });
  }
}
