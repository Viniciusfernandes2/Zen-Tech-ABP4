import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

/**
 * GET /usuarios/me
 * Retorna os dados do usuário logado
 */
export async function getMeuPerfil(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id, nome_completo, data_nascimento, telefone, email, criado_em')
      .eq('id', usuarioId)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado', detalhe: error?.message });
    }

    return res.json({ usuario });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno ao carregar perfil', detalhe: e?.message });
  }
}

/**
 * PATCH /usuarios/me
 * Atualiza os dados do usuário logado
 */
export async function atualizarMeuPerfil(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    const supabaseUserId = (req as any).supabaseUserId as string | undefined;

    if (!usuarioId || !supabaseUserId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const camposPermitidos = ['nome_completo', 'telefone', 'data_nascimento'];
    const dadosAtualizar: any = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        dadosAtualizar[campo] = req.body[campo];
      }
    }

    if (Object.keys(dadosAtualizar).length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo válido enviado para atualização.' });
    }

    // Atualiza tabela local
    const { data: atualizado, error: updateErr } = await supabaseAdmin
      .from('usuarios')
      .update(dadosAtualizar)
      .eq('id', usuarioId)
      .select('*')
      .single();

    if (updateErr) {
      return res.status(500).json({
        erro: 'Falha ao atualizar usuário',
        detalhe: updateErr.message
      });
    }

    return res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario: atualizado });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno ao atualizar perfil', detalhe: e?.message });
  }
}

/**
 * DELETE /usuarios/me
 * Deleta a conta do usuário logado
 * Remove no Supabase Auth + remove no DB interno
 */
export async function deletarMinhaConta(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    const supabaseUserId = (req as any).supabaseUserId as string | undefined;

    if (!usuarioId || !supabaseUserId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    // 1) Remove da tabela interna
    const { error: delErrDb } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', usuarioId);

    if (delErrDb) {
      return res.status(500).json({
        erro: 'Falha ao remover usuário do banco interno',
        detalhe: delErrDb.message
      });
    }

    // 2) Remove do Supabase Auth
    const { error: delAuthErr } = await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);

    if (delAuthErr) {
      return res.status(500).json({
        erro: 'Usuário removido internamente, mas falhou no Supabase Auth',
        detalhe: delAuthErr.message
      });
    }

    return res.json({ mensagem: 'Conta removida com sucesso.' });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno ao remover usuário', detalhe: e?.message });
  }
}


