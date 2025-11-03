import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { User } from '@supabase/supabase-js'; 

export async function criarAssistido(req: Request, res: Response) {
  console.log (req.body);
  try {
    const { nome_completo, data_nascimento, observacoes, telefone_1, telefone_2 } = req.body;
    if (!nome_completo) return res.status(400).json({ erro: 'Informe o nome do assistido.' });

    const { data, error } = await supabaseAdmin
      .from('assistidos')
      .insert({nome_completo, data_nascimento, observacoes, telefone_1, telefone_2 })
      .select()
      .single();
      // Fim da correção

    if (error) return res.status(400).json({ erro: 'Falha ao criar assistido', detalhe: error.message });
    return res.status(201).json({ mensagem: 'Assistido criado', assistido: data });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

export async function listarAssistidosDoCuidador(req: Request, res: Response) {
  try {
    const { cuidador, email } = req.query as { cuidador?: string; email?: string };
    let idAuth = cuidador;

    if (!idAuth && email) {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) return res.status(400).json({ erro: 'Falha ao consultar Auth', detalhe: error.message });
      const found = users.users.find((u: User) => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) return res.status(404).json({ erro: 'E-mail não encontrado no Auth.' });
      idAuth = found.id;
    }

    if (!idAuth) return res.status(400).json({ erro: 'Informe ?cuidador=ID_AUTH ou ?email=...' });

    const { data: usuario, error: userErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, id_auth, nome')
      .eq('id_auth', idAuth)
      .single();

    if (userErr || !usuario) return res.status(404).json({ erro: 'Perfil de cuidador não encontrado.' });

    const { data: links, error: linkErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select(`assistido:assistidos(id, nome, data_nascimento, observacoes, criado_em), papel`)
      .eq('usuario_id', usuario.id);

    if (linkErr) return res.status(400).json({ erro: 'Falha ao listar vínculos', detalhe: linkErr.message });

    const assistidos = (links || []).map(r => ({ ...r.assistido, papel: r.papel })).filter(Boolean);
    return res.json({ cuidador: { id_auth: usuario.id_auth, nome: usuario.nome }, assistidos });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

export async function buscarAssistido(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('assistidos')
      .select('id, nome, data_nascimento, observacoes, criado_em')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ erro: 'Assistido não encontrado.' });
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

export async function meusAssistidos(req: Request, res: Response) {
  try {
    const idAuth = (req as any).supabaseUserId as string | undefined;
    if (!idAuth) return res.status(401).json({ erro: 'Não autenticado' });

    const { data: usuario, error: userErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, id_auth, nome')
      .eq('id_auth', idAuth)
      .single();

    if (userErr || !usuario) return res.status(404).json({ erro: 'Perfil de cuidador não encontrado.' });

    const { data: links, error: linkErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select(`assistido:assistidos(id, nome, data_nascimento, observacoes, criado_em), papel`)
      .eq('usuario_id', usuario.id);

    if (linkErr) return res.status(400).json({ erro: 'Falha ao listar vínculos', detalhe: linkErr.message });

    const assistidos = (links || []).map(r => ({ ...r.assistido, papel: r.papel })).filter(Boolean);
    return res.json({ cuidador: { id_auth: usuario.id_auth, nome: usuario.nome }, assistidos });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}
