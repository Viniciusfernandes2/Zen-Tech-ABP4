
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { gerarDeviceToken, hashDeviceToken } from '../utils/deviceToken';
import bcrypt from 'bcrypt';

interface ReqWithUser extends Request {
  usuarioId?: string;
}

export async function registrarDispositivo(req: Request, res: Response) {
  try {
    const { codigo_esp, nome } = req.body;
    if (!codigo_esp) return res.status(400).json({ erro: 'codigo_esp é obrigatório' });

    // procura dispositivo existente
    const { data: existing, error: exErr } = await supabaseAdmin
      .from('dispositivos')
      .select('*')
      .eq('codigo_esp', codigo_esp)
      .limit(1)
      .maybeSingle();

    if (exErr) {
      return res.status(500).json({ erro: 'Erro ao verificar dispositivo', detalhe: exErr.message });
    }

    const tokenPlain = gerarDeviceToken();
    const tokenHash = await hashDeviceToken(tokenPlain);

    if (!existing) {
      // cria novo dispositivo (assistido_id fica null)
      const { data: created, error: createErr } = await supabaseAdmin
        .from('dispositivos')
        .insert({
          nome: nome || null,
          codigo_esp,
          segredo_hash: null,
          device_token_hash: tokenHash,
          token_revoked: false
        })
        .select('*')
        .single();

      if (createErr) {
        return res.status(500).json({ erro: 'Falha ao criar dispositivo', detalhe: createErr.message });
      }

      return res.status(201).json({
        device_id: created.id,
        device_token: tokenPlain,
        codigo_esp: created.codigo_esp
      });
    }

    // Se já existe: se token_revoked true, reemitir token; se não existir device_token_hash, gerar; caso contrário, retornar token NÃO exposto (por segurança) - melhor reemitir somente se solicitado.
    // Vamos gerar novo token e atualizar o hash para simplificar (token é dado ao device no bootstrap).
    const { data: upd, error: updErr } = await supabaseAdmin
      .from('dispositivos')
      .update({
        nome: nome || existing.nome,
        device_token_hash: tokenHash,
        token_revoked: false
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (updErr) {
      return res.status(500).json({ erro: 'Falha ao atualizar dispositivo', detalhe: updErr.message });
    }

    return res.status(200).json({
      device_id: upd.id,
      device_token: tokenPlain,
      codigo_esp: upd.codigo_esp
    });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno ao registrar dispositivo', detalhe: e?.message });
  }
}

/**
 * POST /device/pair
 * Body: { codigo_esp, assistido_id }
 * Requires user auth (req.usuarioId)
 */
export async function parearDispositivo(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as string | undefined;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const { codigo_esp, assistido_id } = req.body;
    if (!codigo_esp || !assistido_id) {
      return res.status(400).json({ erro: 'codigo_esp e assistido_id são obrigatórios' });
    }

    // Verificar que o usuário pertence ao assistido (tem vínculo)
    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', assistido_id)
      .limit(1)
      .maybeSingle();

    if (vincErr) {
      return res.status(500).json({ erro: 'Falha ao verificar vínculo', detalhe: vincErr.message });
    }
    if (!vinculo) {
      return res.status(403).json({ erro: 'Você não está vinculado a esse assistido' });
    }

    // Buscar dispositivo
    const { data: dispositivo, error: dispErr } = await supabaseAdmin
      .from('dispositivos')
      .select('*')
      .eq('codigo_esp', codigo_esp)
      .limit(1)
      .maybeSingle();

    if (dispErr) {
      return res.status(500).json({ erro: 'Erro ao buscar dispositivo', detalhe: dispErr.message });
    }
    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' });
    }

    // Atualiza dispositivo com assistido_id, paired_by, paired_at
    const { data: updated, error: updErr } = await supabaseAdmin
      .from('dispositivos')
      .update({
        assistido_id,
        paired_by: usuarioId,
        paired_at: new Date().toISOString()
      })
      .eq('id', dispositivo.id)
      .select('*')
      .single();

    if (updErr) {
      return res.status(500).json({ erro: 'Falha ao parear dispositivo', detalhe: updErr.message });
    }

    return res.json({ mensagem: 'Pareado com sucesso', dispositivo: updated });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno no pareamento', detalhe: e?.message });
  }
}

/**
 * POST /device/event
 * Body: { event_id?, source_timestamp?, event_type?, eixo_x, eixo_y, eixo_z, totalacc, raw_payload? }
 * Auth: deviceAuth middleware
 */
export async function registrarEventoDispositivo(req: Request, res: Response) {
  try {
    // deviceAuth middleware must populate req.device
    const device = (req as any).device;
    if (!device) return res.status(401).json({ erro: 'Dispositivo não autenticado' });

    const {
      event_id = null,
      source_timestamp = null,
      event_type = 'queda',
      eixo_x = null,
      eixo_y = null,
      eixo_z = null,
      totalacc = null,
      raw_payload = null
    } = req.body as any;

    // deduplicação por event_id (se fornecido)
    if (event_id) {
      const { data: exists, error: exErr } = await supabaseAdmin
        .from('hist_quedas')
        .select('id')
        .eq('event_id', event_id)
        .limit(1)
        .maybeSingle();

      if (exErr) {
        return res.status(500).json({ erro: 'Erro ao checar event_id', detalhe: exErr.message });
      }
      if (exists) {
        return res.status(200).json({ ok: true, mensagem: 'Evento já registrado' });
      }
    }

    // Inserir na tabela hist_quedas
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('hist_quedas')
      .insert({
        event_id,
        source_timestamp: source_timestamp ? source_timestamp : null,
        event_type,
        eixo_x,
        eixo_y,
        eixo_z,
        totalacc,
        raw_payload: raw_payload ? raw_payload : null,
        dispositivo_id: device.id,
        assistido_id: device.assistido_id
      })
      .select('*')
      .single();

    if (insErr) {
      return res.status(500).json({ erro: 'Falha ao registrar evento', detalhe: insErr.message });
    }

    // Atualizar last_seen
    await supabaseAdmin
      .from('dispositivos')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', device.id);

    // Buscar cuidadores vinculados ao assistido
    if (device.assistido_id) {
      const { data: cuidadores, error: cErr } = await supabaseAdmin
        .from('usuarios_assistidos')
        .select(`
      usuario:usuarios (
        id,
        nome_completo,
        telefone
      )
    `)
        .eq('assistido_id', device.assistido_id);

      if (!cErr && Array.isArray(cuidadores) && cuidadores.length > 0) {
        for (const c of cuidadores) {
          const usuario = Array.isArray(c.usuario) ? c.usuario[0] : c.usuario;

          if (usuario) {
            console.log(
              `Notificar ${usuario.id} (${usuario.nome_completo}) sobre queda do assistido ${device.assistido_id}`
            );
          }
        }
      }
    }

    return res.status(201).json({ ok: true, evento: inserted });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno ao registrar evento', detalhe: e?.message });
  }
}

/**
 * POST /device/heartbeat
 * Only updates last_seen (deviceAuth required)
 */
export async function heartbeatDispositivo(req: Request, res: Response) {
  try {
    const device = (req as any).device;
    if (!device) return res.status(401).json({ erro: 'Dispositivo não autenticado' });

    const { error: updErr } = await supabaseAdmin
      .from('dispositivos')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', device.id);

    if (updErr) {
      return res.status(500).json({ erro: 'Falha ao atualizar last_seen', detalhe: updErr.message });
    }

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno heartbeat', detalhe: e?.message });
  }
}

