import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export async function criarCuidador(req: Request, res: Response) {
  try {
    const { email, senha, nome, telefone } = req.body;
    if (!email || !senha || !nome) {
      return res.status(400).json({ erro: 'Informe email, senha e nome.' });
    }
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password: senha, email_confirm: true
    });
    if (authError || !authData.user) {
      return res.status(400).json({ erro: 'Falha ao criar usuário no Auth', detalhe: authError?.message });
    }
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .insert({ id_auth: authData.user.id, nome, telefone })
      .select()
      .single();
    if (perfilError) {
      return res.status(400).json({ erro: 'Falha ao criar perfil', detalhe: perfilError.message });
    }
    return res.status(201).json({ mensagem: 'Cuidador criado', usuario: perfil });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}
