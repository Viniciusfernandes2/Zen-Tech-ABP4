import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

/**
 * Gera um código de compartilhamento curto.
 * Evita letras/nums que causam confusão (I, O, 1, 0).
 */
function gerarCodigoCompartilhamento(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Tenta gerar um código único verificando a tabela.
 * Faz algumas tentativas antes de falhar.
 */
async function gerarCodigoUnico() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const codigo = gerarCodigoCompartilhamento(6);
    const { data: exists, error: existsErr } = await supabaseAdmin
      .from('assistidos')
      .select('id')
      .eq('codigo_compartilhamento', codigo)
      .limit(1)
      .maybeSingle();

    if (existsErr) {
      // em caso de erro de consulta, não abortamos imediatamente — tentamos novamente,
      // mas registramos a falha no log (supabaseAdmin não tem logger aqui).
      continue;
    }

    if (!exists) {
      return codigo;
    }
    // se existe, loop e gera outro
  }

  throw new Error('Falha ao gerar código único para assistido (tente novamente).');
}

/**
 * POST /assistidos
 * Requer autenticação (middleware deve popular req.usuarioId)
 * Cria assistido + código_compartilhamento + cria vínculo automático em usuarios_assistidos
 */
export async function criarAssistido(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const {
      nome_completo,
      data_nascimento,
      observacoes = null,
      telefone_1 = null,
      telefone_2 = null
    } = req.body;

    if (!nome_completo || !data_nascimento) {
      return res.status(400).json({ erro: 'nome_completo e data_nascimento são obrigatórios.' });
    }

    // Gerar código único (poderá lançar erro se não conseguir)
    let codigoCompartilhamento: string;
    try {
      codigoCompartilhamento = await gerarCodigoUnico();
    } catch (e: any) {
      return res.status(500).json({ erro: 'Não foi possível gerar código de compartilhamento', detalhe: e?.message });
    }

    // Inserir assistido
    const { data: assistidoCreated, error: assistCreateErr } = await supabaseAdmin
      .from('assistidos')
      .insert({
        nome_completo,
        data_nascimento,
        observacoes,
        telefone_1,
        telefone_2,
        codigo_compartilhamento: codigoCompartilhamento
      })
      .select('*')
      .single();

    if (assistCreateErr || !assistidoCreated) {
      return res.status(500).json({ erro: 'Falha ao criar assistido', detalhe: assistCreateErr?.message });
    }

    // Criar vínculo idempotente na tabela usuarios_assistidos
    // Primeiro verifica se já existe (teoricamente não existe porque assistido é novo,
    // mas por segurança e para casos de reexecução, fazemos verificação)
    const { data: existingLink, error: existingErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', assistidoCreated.id)
      .limit(1)
      .maybeSingle();

    if (existingErr) {
      // Se houve erro ao verificar vínculo, tentamos criar, mas avisamos no log via response detalhe
      const { data: vinculoTry, error: vinculoTryErr } = await supabaseAdmin
        .from('usuarios_assistidos')
        .insert({ usuario_id: usuarioId, assistido_id: assistidoCreated.id })
        .select('*')
        .maybeSingle();

      if (vinculoTryErr) {
        // opcional: remover assistidoCreated para manter consistência?
        return res.status(500).json({ erro: 'Assistido criado mas falha ao criar vínculo', detalhe: vinculoTryErr.message });
      }

      return res.status(201).json({ assistido: assistidoCreated, vinculo: vinculoTry });
    }

    if (!existingLink) {
      const { data: vinculoCreated, error: vinculoErr } = await supabaseAdmin
        .from('usuarios_assistidos')
        .insert({ usuario_id: usuarioId, assistido_id: assistidoCreated.id })
        .select('*')
        .single();

      if (vinculoErr) {
        // se falhar ao criar vínculo, podemos optar por deletar assistidoCreated para consistência.
        // aqui optamos por sinalizar erro.
        return res.status(500).json({ erro: 'Assistido criado mas falha ao criar vínculo', detalhe: vinculoErr.message });
      }

      return res.status(201).json({ assistido: assistidoCreated, vinculo: vinculoCreated });
    }

    // se já existia (raro), só retorna o assistido
    return res.status(201).json({ assistido: assistidoCreated, mensagem: 'Assistido criado. Vínculo já existente.' });

  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno no servidor', detalhe: e?.message });
  }
}

/**
 * GET /assistidos/meus
 * Retorna lista de assistidos vinculados ao usuário logado
 * Requer req.usuarioId
 */
export async function meusAssistidos(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    // Seleciona os assistidos através da tabela de vínculo
    const { data: links, error: linkErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('assistido:assistidos(id, nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, codigo_compartilhamento, criado_em)')
      .eq('usuario_id', usuarioId);

    if (linkErr) {
      return res.status(500).json({ erro: 'Falha ao listar assistidos', detalhe: linkErr.message });
    }

    const assistidos = (links || []).map((r: any) => r.assistido).filter(Boolean);
    return res.json({ assistidos });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno no servidor', detalhe: e?.message });
  }
}

/**
 * GET /assistidos/:id
 * Retorna assistido somente se o usuário logado estiver vinculado a ele
 */
export async function buscarAssistido(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const assistidoId = req.params.id;
    if (!assistidoId) return res.status(400).json({ erro: 'assistido id é obrigatório' });

    // Verificar vínculo
    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', assistidoId)
      .limit(1)
      .maybeSingle();

    if (vincErr) return res.status(500).json({ erro: 'Falha ao verificar vínculo', detalhe: vincErr.message });
    if (!vinculo) return res.status(403).json({ erro: 'Acesso negado a esse assistido' });

    // Buscar assistido
    const { data: assistido, error: assistErr } = await supabaseAdmin
      .from('assistidos')
      .select('id, nome_completo, data_nascimento, observacoes, telefone_1, telefone_2, codigo_compartilhamento, criado_em')
      .eq('id', assistidoId)
      .single();

    if (assistErr || !assistido) return res.status(404).json({ erro: 'Assistido não encontrado', detalhe: assistErr?.message });

    return res.json({ assistido });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno no servidor', detalhe: e?.message });
  }
}

