import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// ======================================
// 🟢 Criar assistido
// ======================================
export async function criarAssistido(req: Request, res: Response) {
  try {
    const { nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, usuario_id } = req.body;

    if (!nome_completo) {
      return res.status(400).json({ erro: 'Informe o nome completo do assistido.' });
    }

    if (!usuario_id) {
      return res.status(400).json({ erro: 'Informe o ID do usuário (cuidador).' });
    }

    const { data, error } = await supabaseAdmin
      .from('assistidos')
      .insert({ nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, usuario_id })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ erro: 'Falha ao criar assistido', detalhe: error.message });
    }

    return res.status(201).json({ mensagem: 'Assistido criado com sucesso', assistido: data });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

// ======================================
// 🟢 Listar assistidos do cuidador (por ID Auth ou email)
// ======================================
export async function listarAssistidosDoCuidador(req: Request, res: Response) {
  try {
    const { cuidador, email } = req.query as { cuidador?: string; email?: string };
    let idAuth = cuidador;

    if (!idAuth && email) {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) return res.status(400).json({ erro: 'Falha ao consultar Auth', detalhe: error.message });
      const found = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) return res.status(404).json({ erro: 'E-mail não encontrado no Auth.' });
      idAuth = found.id;
    }

    if (!idAuth) {
      return res.status(400).json({ erro: 'Informe ?cuidador=ID_AUTH ou ?email=...' });
    }

    const { data: usuario, error: userErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id, nome_completo')
      .eq('auth_user_id', idAuth)
      .single();

    if (userErr || !usuario) {
      return res.status(404).json({ erro: 'Perfil de cuidador não encontrado.' });
    }

    const { data: assistidos, error: assistErr } = await supabaseAdmin
      .from('assistidos')
      .select('id, nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, criado_em')
      .eq('usuario_id', usuario.id);

    if (assistErr) {
      return res.status(400).json({ erro: 'Falha ao listar assistidos', detalhe: assistErr.message });
    }

    return res.json({
      cuidador: { id_auth: usuario.auth_user_id, nome_completo: usuario.nome_completo },
      assistidos,
    });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

// ======================================
// 🟢 Buscar assistido por ID
// ======================================
export async function buscarAssistido(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('assistidos')
      .select('id, nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, criado_em')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ erro: 'Assistido não encontrado.' });
    }

    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

// ======================================
// 🟢 Meus assistidos (baseado no usuário autenticado)
// ======================================
export async function meusAssistidos(req: Request, res: Response) {
  try {
    const idAuth = (req as any).supabaseUserId as string | undefined;
    if (!idAuth) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const { data: usuario, error: userErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id, nome_completo')
      .eq('auth_user_id', idAuth)
      .single();

    if (userErr || !usuario) {
      return res.status(404).json({ erro: 'Perfil de cuidador não encontrado.' });
    }

    const { data: assistidos, error: assistErr } = await supabaseAdmin
      .from('assistidos')
      .select('id, nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, criado_em')
      .eq('usuario_id', usuario.id);

    if (assistErr) {
      return res.status(400).json({ erro: 'Falha ao listar assistidos', detalhe: assistErr.message });
    }

    return res.json({
      cuidador: { id_auth: usuario.auth_user_id, nome_completo: usuario.nome_completo },
      assistidos,
    });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

