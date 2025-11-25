import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";

/**
 * Converte data BR (20/06/1996 ou 20-06-1996) para ISO (1996-06-20)
 * Também aceita ISO direto e retorna sem mexer.
 */
function normalizarData(data: string) {
  if (!data) return null;

  // Se já estiver em ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return data; // já está correto
  }

  // BR com barra → DD/MM/YYYY
  if (data.includes("/")) {
    const [dia, mes, ano] = data.split("/");
    if (dia && mes && ano) return `${ano}-${mes}-${dia}`;
  }

  // BR com hífen → DD-MM-YYYY
  if (data.includes("-")) {
    const [dia, mes, ano] = data.split("-");
    if (dia && mes && ano) return `${ano}-${mes}-${dia}`;
  }

  return null; // formato inválido
}

export async function registerUsuario(req: Request, res: Response) {
  try {
    const { email, senha, nome_completo, telefone, data_nascimento } = req.body;

    // -------------------------------
    // 1. Validação dos campos
    // -------------------------------
    if (!email || !senha || !nome_completo || !data_nascimento) {
      return res.status(400).json({
        erro: "Email, senha, nome completo e data de nascimento são obrigatórios.",
      });
    }

    // -------------------------------
    // 2. Normalizar Data
    // -------------------------------
    const dataISO = normalizarData(data_nascimento);

    if (!dataISO) {
      return res.status(400).json({
        erro: "Data de nascimento inválida. Use DD/MM/YYYY ou YYYY-MM-DD.",
      });
    }

    // -------------------------------
    // 3. Criar no Supabase Auth
    // -------------------------------
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      });

    if (authErr || !authData.user) {
      return res.status(400).json({
        erro: "Falha ao registrar usuário (Supabase Auth)",
        detalhe: authErr?.message,
      });
    }

    const auth_user_id = authData.user.id;

    // -------------------------------
    // 4. Criar perfil interno
    // -------------------------------
    const { data: newUser, error: insertErr } = await supabaseAdmin
      .from("usuarios")
      .insert({
        auth_user_id,
        email,
        nome_completo,
        telefone: telefone || null,
        data_nascimento: dataISO, // já convertemos
      })
      .select("*")
      .single();

    if (insertErr) {
      return res.status(500).json({
        erro: "Falha ao criar perfil interno",
        detalhe: insertErr.message,
      });
    }

    // -------------------------------
    // 5. OK
    // -------------------------------
    return res.status(201).json({
      mensagem: "Usuário registrado com sucesso!",
      usuario: newUser,
    });

  } catch (e: any) {
    return res.status(500).json({
      erro: "Erro interno ao registrar",
      detalhe: e?.message,
    });
  }
}