import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

interface ReqWithUser extends Request {
  usuarioId?: string;
}

export async function salvarExpoPushToken(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    const { expo_push_token } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    if (!expo_push_token) {
      return res.status(400).json({ erro: "expo_push_token é obrigatório" });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("usuarios")
      .update({ expo_push_token })
      .eq("id", usuarioId)
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({
        erro: "Falha ao salvar expo_push_token",
        detalhe: error.message,
      });
    }

    return res.json({
      mensagem: "expo_push_token salvo com sucesso!",
      usuario: updated,
    });

  } catch (e: any) {
    return res.status(500).json({
      erro: "Erro interno ao salvar expo_push_token",
      detalhe: e?.message,
    });
  }
}
