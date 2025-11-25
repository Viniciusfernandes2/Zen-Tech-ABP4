import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";

export async function loginUsuario(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios.",
      });
    }

    // 1. LOGIN NO SUPABASE
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (authError || !authData?.user || !authData?.session) {
      return res.status(401).json({
        erro: "Email ou senha inválidos.",
        detalhe: authError?.message,
      });
    }

    const token = authData.session.access_token;
    const auth_user_id = authData.user.id;

    // 2. BUSCAR PERFIL INTERNO
    const { data: usuarioInterno, error: dbErr } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("auth_user_id", auth_user_id)
      .single();

    if (dbErr || !usuarioInterno) {
      return res.status(400).json({
        erro: "Usuário sem perfil interno. Registre-se primeiro.",
      });
    }

    return res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: usuarioInterno,
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: "Erro interno no login",
      detalhe: e?.message,
    });
  }
}