import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export async function vincularCuidadorIdoso(req: Request, res: Response) {
  try {
    const { assistido_id, id_auth_cuidador, papel = 'responsavel' } = req.body;
    if (!assistido_id || !id_auth_cuidador) {
      return res.status(400).json({ erro: 'Informe assistido_id e id_auth_cuidador.' });
    }

    const { data: cuidador, error: userErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, id_auth')
      .eq('id_auth', id_auth_cuidador)
      .single();

    if (userErr || !cuidador) return res.status(404).json({ erro: 'Cuidador não encontrado.' });

    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .insert({ usuario_id: cuidador.id, assistido_id, papel })
      .select()
      .single();

    if (vincErr) return res.status(400).json({ erro: 'Falha ao criar vínculo', detalhe: vincErr.message });
    return res.status(201).json({ mensagem: 'Vínculo criado', vinculo });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}
