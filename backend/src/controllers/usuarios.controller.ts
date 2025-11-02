import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export async function criarCuidador(req: Request, res: Response) {

  try {
    const { nome, data_nascimento, email, senha, telefone } = req.body;
    if (!email || !senha || !nome) {
      return res.status(400).json({ erro: 'Informe email, senha e nome.' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password: senha, email_confirm: true
    });

    if (authError || !authData.user) {
      return res.status(400).json({ erro: 'Falha ao criar usuário no Auth', detalhe: authError?.message });
    }

    console.log('nome            -> ' + nome);
    console.log('data_nascimento -> ' + data_nascimento);
    console.log('email           -> ' + email);
    console.log('senha           -> ' + senha);
    console.log('telefone        -> ' + telefone);
    console.log('id              -> ' + authData.user.id);

    // Bruno Menezes 01.11.2025: Correção dos nomes da tabela

    /*const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .insert({ id_auth: authData.user.id, nome, telefone })
      .select()
      .single();*/

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .insert({ auth_user_id: authData.user.id, nome_completo: nome, data_nascimento, email, senha_hash: senha, telefone})
      .select()
      .single();

    // Fim da correção

    if (perfilError) {
      return res.status(400).json({ erro: 'Falha ao criar perfil', detalhe: perfilError.message });
    }
    return res.status(201).json({ mensagem: 'Cuidador criado', usuario: perfil });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}
