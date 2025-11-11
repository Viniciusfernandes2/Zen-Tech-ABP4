import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";

// Cadastra um novo dispositivo no banco (sem vínculo ainda)
export const registrarDispositivo = async (req: Request, res: Response) => {
  const { codigo_esp } = req.body;

  if (!codigo_esp)
    return res.status(400).json({ error: "Código do dispositivo obrigatório" });

  const { data, error } = await supabaseAdmin
    .from("dispositivos")
    .insert([{ codigo_esp }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json({
    message: "Dispositivo registrado, aguardando vinculação.",
    dispositivo: data[0],
  });
};

// Vincula o dispositivo a um idoso (assistido)
export const vincularDispositivo = async (req: Request, res: Response) => {
  const { codigo_esp, assistido_id } = req.body;

  if (!codigo_esp || !assistido_id)
    return res.status(400).json({ error: "Dados insuficientes" });

  // Verifica se o dispositivo existe
  const { data: dispositivo, error: findError } = await supabaseAdmin
    .from("dispositivos")
    .select("*")
    .eq("codigo_esp", codigo_esp)
    .single();

  if (findError || !dispositivo)
    return res.status(404).json({ error: "Dispositivo não encontrado" });

  // Atualiza o vínculo com o assistido
  const { error: updateError } = await supabaseAdmin
    .from("dispositivos")
    .update({ assistido_id })
    .eq("codigo_esp", codigo_esp);

  if (updateError)
    return res.status(500).json({ error: updateError.message });

  return res.status(200).json({ message: "Dispositivo vinculado com sucesso!" });
};
