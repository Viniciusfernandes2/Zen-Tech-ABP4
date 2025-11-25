import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";

/**
 * POST /vinculos
 * Vínculo baseado em código de compartilhamento
 */
export async function vincularCuidadorIdoso(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId;
    const { codigo } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    if (!codigo) {
      return res.status(400).json({ erro: "Código é obrigatório." });
    }

    // 1) Buscar assistido pelo código
    const { data: assistido, error: assistErr } = await supabaseAdmin
      .from("assistidos")
      .select("*")
      .eq("codigo_compartilhamento", codigo)
      .single();

    if (assistErr || !assistido) {
      return res.status(404).json({
        erro: "Nenhum assistido encontrado com esse código.",
        detalhe: assistErr?.message,
      });
    }

    const assistidoId = assistido.id;

    // 2) Verificar se já existe vínculo
    const { data: vincExistente, error: vincErrCheck } = await supabaseAdmin
      .from("usuarios_assistidos")
      .select("id")
      .eq("usuario_id", usuarioId)
      .eq("assistido_id", assistidoId)
      .maybeSingle();

    if (vincErrCheck) {
      return res.status(500).json({
        erro: "Falha ao verificar vínculo existente.",
        detalhe: vincErrCheck.message,
      });
    }

    if (vincExistente) {
      return res.json({
        mensagem: "Você já está vinculado a este assistido.",
        assistido,
      });
    }

    // 3) Criar vínculo
    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from("usuarios_assistidos")
      .insert({
        usuario_id: usuarioId,
        assistido_id: assistidoId,
      })
      .select("*")
      .single();

    if (vincErr || !vinculo) {
      return res.status(500).json({
        erro: "Falha ao criar vínculo.",
        detalhe: vincErr?.message,
      });
    }

    return res.status(201).json({
      mensagem: "Vínculo criado com sucesso!",
      assistido,
      vinculo,
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: "Erro interno ao vincular cuidador.",
      detalhe: e?.message,
    });
  }
}

/**
 * DELETE /vinculos/:assistido_id
 * Desvincular cuidador de um assistido
 */
export async function desvincularCuidador(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId;
    const assistidoId = req.params.assistido_id;

    if (!usuarioId) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    if (!assistidoId) {
      return res.status(400).json({ erro: "assistido_id é obrigatório" });
    }

    // 1) Verificar se vínculo existe
    const { data: vinculo, error: vincErrCheck } = await supabaseAdmin
      .from("usuarios_assistidos")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("assistido_id", assistidoId)
      .maybeSingle();

    if (vincErrCheck) {
      return res.status(500).json({
        erro: "Falha ao verificar vínculo.",
        detalhe: vincErrCheck.message,
      });
    }

    if (!vinculo) {
      return res.status(404).json({
        erro: "Nenhum vínculo encontrado com esse assistido.",
      });
    }

    // 2) Apagar vínculo
    const { error: delErr } = await supabaseAdmin
      .from("usuarios_assistidos")
      .delete()
      .eq("usuario_id", usuarioId)
      .eq("assistido_id", assistidoId);

    if (delErr) {
      return res.status(500).json({
        erro: "Falha ao remover vínculo.",
        detalhe: delErr.message,
      });
    }

    return res.json({
      mensagem: "Vínculo removido com sucesso.",
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: "Erro interno ao remover vínculo.",
      detalhe: e?.message,
    });
  }
}

