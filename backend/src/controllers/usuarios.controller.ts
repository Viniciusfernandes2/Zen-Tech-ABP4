import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export async function criarUsuario(req: Request, res: Response) {
  try {
    const { nome_completo, data_nascimento, telefone, email, senha } = req.body;

    // Verifica se os campos obrigatórios foram enviados
    if (!nome_completo || !data_nascimento || !email || !senha) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome_completo, data_nascimento, email e senha.' });
    }

    // Cria o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

    if (authError || !authData?.user) {
      return res.status(400).json({ erro: 'Falha ao criar usuário no Auth', detalhe: authError?.message });
    }

    // Gera hash da senha para salvar na tabela
    const senha_hash = await bcrypt.hash(senha, 10);

    // Insere o perfil na tabela "usuarios"
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_user_id: authData.user.id,
        nome_completo,
        data_nascimento,
        telefone,
        email,
        senha_hash,
      })
      .select()
      .single();

    if (usuarioError) {
      return res.status(400).json({ erro: 'Falha ao criar perfil no banco de dados', detalhe: usuarioError.message });
    }

    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso.',
      usuario,
    });
  } catch (e: any) {
    console.error('Erro ao criar usuário:', e);
    return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: e?.message });
  }
}
