import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

/* ============================================================
   CREATE – Criar novo usuário
============================================================ */
export async function criarUsuario(req: Request, res: Response) {
  console.log("req.body:", req.body);

  try {
    const { nome_completo, data_nascimento, email, senha, telefone } = req.body;
    if (!email || !senha || !nome_completo) {
      return res.status(400).json({ erro: 'Informe email, senha e nome.' });
    }

    // Cria o usuário no Auth do Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return res.status(400).json({ erro: 'Falha ao criar usuário no Auth', detalhe: authError?.message });
    }

    // Insere o perfil na tabela "usuarios"
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_user_id: authData.user.id,
        nome_completo,
        data_nascimento,
        email,
        senha_hash: senha,
        telefone,
      })
      .select()
      .single();

    if (perfilError) {
      return res.status(400).json({ erro: 'Falha ao criar perfil', detalhe: perfilError.message });
    }

    return res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: perfil });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

/* ============================================================
   READ (LISTAR TODOS) – Retorna todos os usuários
============================================================ */
export async function listarUsuarios(_req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*');

    if (error) {
      return res.status(400).json({ erro: 'Erro ao buscar usuários', detalhe: error.message });
    }

    return res.status(200).json({ usuarios: data });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

/* ============================================================
   READ (BUSCAR POR ID) – Retorna um único usuário
============================================================ */
export async function buscarUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ erro: 'Informe o ID do usuário.' });

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ erro: 'Usuário não encontrado', detalhe: error?.message });
    }

    return res.status(200).json({ usuario: data });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

/* ============================================================
   UPDATE – Atualiza dados do usuário
============================================================ */
export async function atualizarUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nome_completo, data_nascimento, email, telefone } = req.body;

    if (!id) return res.status(400).json({ erro: 'Informe o ID do usuário.' });

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update({ nome_completo, data_nascimento, email, telefone })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({ erro: 'Erro ao atualizar usuário', detalhe: error?.message });
    }

    return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!', usuario: data });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

/* ============================================================
   DELETE – Remove um usuário do banco e do Auth
============================================================ */
export async function deletarUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ erro: 'Informe o ID do usuário.' });

    // 1️⃣ Busca o usuário para pegar o auth_user_id
    const { data: usuario, error: buscaError } = await supabaseAdmin
      .from('usuarios')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    if (buscaError || !usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado', detalhe: buscaError?.message });
    }

    // 2️⃣ Remove da tabela "usuarios"
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (dbError) {
      return res.status(400).json({ erro: 'Erro ao deletar usuário no banco', detalhe: dbError.message });
    }

    // 3️⃣ Remove também do Auth do Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(usuario.auth_user_id);

    if (authError) {
      return res.status(400).json({ erro: 'Erro ao deletar usuário do Auth', detalhe: authError.message });
    }

    return res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

