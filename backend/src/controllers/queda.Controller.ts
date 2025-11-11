import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase"; 

// Limite máximo de registros por dispositivo
const MAX_QUEDAS_POR_DISPOSITIVO = 500;

export const registrarQueda = async (req: Request, res: Response) => {
  try {
    const { codigo_esp } = req.body;

    if (!codigo_esp) {
      return res.status(400).json({ erro: "codigo_esp é obrigatório" });
    }

    // 1️⃣ Localiza o dispositivo
    const { data: dispositivo, error: erroDisp } = await supabaseAdmin
      .from("dispositivos")
      .select("id, assistido_id")
      .eq("codigo_esp", codigo_esp)
      .single();

    if (erroDisp || !dispositivo) {
      return res.status(404).json({ erro: "Dispositivo não encontrado ou não vinculado." });
    }

    if (!dispositivo.assistido_id) {
      return res.status(400).json({ erro: "Dispositivo ainda não vinculado a um assistido." });
    }

    // 2️⃣ Registra a nova queda
    const novaQueda = {
      dispositivo_id: dispositivo.id,
      data_hora: new Date().toISOString(),
      info: {
        alerta: "queda detectada",
        origem: "ESP32",
      },
    };

    const { error: erroInsert } = await supabaseAdmin.from("hist_quedas").insert([novaQueda]);

    if (erroInsert) {
      console.error("Erro ao inserir queda:", erroInsert);
      return res.status(500).json({ erro: "Falha ao salvar queda" });
    }

    console.log(`✅ Queda registrada para dispositivo ${codigo_esp}`);

    // 3️⃣ Limpeza automática de registros antigos
    const { data: todasQuedas, error: erroSelect } = await supabaseAdmin
      .from("hist_quedas")
      .select("id, data_hora")
      .eq("dispositivo_id", dispositivo.id)
      .order("data_hora", { ascending: false });

    if (!erroSelect && todasQuedas && todasQuedas.length > MAX_QUEDAS_POR_DISPOSITIVO) {
      const idsAntigos = todasQuedas
        .slice(MAX_QUEDAS_POR_DISPOSITIVO)
        .map((q) => q.id);

      await supabaseAdmin.from("hist_quedas").delete().in("id", idsAntigos);

      console.log(`🧹 ${idsAntigos.length} registros antigos removidos.`);
    }

    return res.json({
      status: "ok",
      mensagem: "Queda registrada com sucesso.",
      dispositivo_id: dispositivo.id,
      data_hora: novaQueda.data_hora,
    });
  } catch (error: any) {
    console.error("❌ Erro ao registrar queda:", error);
    return res.status(500).json({
      erro: "Erro interno ao registrar queda",
      detalhe: error.message,
    });
  }
};
