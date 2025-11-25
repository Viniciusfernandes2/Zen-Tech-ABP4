import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import {
  gerarDeviceToken,
  hashDeviceToken,
  gerarCodigoCurto
} from '../utils/deviceToken';
import bcrypt from 'bcrypt';

interface ReqWithUser extends Request {
  usuarioId?: string;
}

/**
 * POST /device/register
 */
export async function registrarDispositivo(req: Request, res: Response) {
  try {
    const { codigo_esp, nome } = req.body;

    if (!codigo_esp) {
      return res.status(400).json({ erro: 'codigo_esp é obrigatório' });
    }

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('dispositivos')
      .select('*')
      .eq('codigo_esp', codigo_esp)
      .limit(1)
      .maybeSingle();

    if (exErr) {
      return res.status(500).json({
        erro: 'Erro ao verificar dispositivo',
        detalhe: exErr.message
      });
    }

    const tokenPlain = gerarDeviceToken();
    const tokenHash = await hashDeviceToken(tokenPlain);
    const codigoCurto = gerarCodigoCurto();

    if (!existing) {
      const { data: created, error: createErr } = await supabaseAdmin
        .from('dispositivos')
        .insert({
          nome: nome || null,
          codigo_esp,
          codigo_curto: codigoCurto,
          segredo_hash: null,
          device_token_hash: tokenHash,
          token_revoked: false
        })
        .select('*')
        .single();

      if (createErr) {
        return res.status(500).json({
          erro: 'Falha ao criar dispositivo',
          detalhe: createErr.message
        });
      }

      return res.status(201).json({
        device_id: created.id,
        device_token: tokenPlain,
        codigo_esp: created.codigo_esp,
        codigo_curto: created.codigo_curto
      });
    }

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
      return res.status(500).json({
        erro: 'Falha ao atualizar dispositivo',
        detalhe: updErr.message
      });
    }

    return res.status(200).json({
      device_id: upd.id,
      device_token: tokenPlain,
      codigo_esp: upd.codigo_esp,
      codigo_curto: upd.codigo_curto
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno ao registrar dispositivo',
      detalhe: e?.message
    });
  }
}

/**
 * POST /device/pair
 */
export async function parearDispositivo(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const { codigo_esp, codigo_curto, assistido_id, pair_code } = req.body;

    if (!codigo_curto && !codigo_esp) {
      return res.status(400).json({
        erro: 'Envie codigo_curto OU codigo_esp'
      });
    }

    if (!assistido_id) {
      return res.status(400).json({
        erro: 'assistido_id é obrigatório'
      });
    }

    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', assistido_id)
      .limit(1)
      .maybeSingle();

    if (vincErr) {
      return res.status(500).json({
        erro: 'Falha ao verificar vínculo',
        detalhe: vincErr.message
      });
    }

    if (!vinculo) {
      return res.status(403).json({
        erro: 'Você não está vinculado a esse assistido'
      });
    }

    let query = supabaseAdmin.from('dispositivos').select('*').limit(1);
    if (codigo_curto) query = query.eq('codigo_curto', codigo_curto);
    else query = query.eq('codigo_esp', codigo_esp);

    const { data: dispositivo, error: dispErr } = await query.maybeSingle();

    if (dispErr) {
      return res.status(500).json({
        erro: 'Erro ao buscar dispositivo',
        detalhe: dispErr.message
      });
    }

    if (!dispositivo) {
      return res.status(404).json({ erro: 'Dispositivo não encontrado' });
    }

    if (dispositivo.assistido_id !== null) {
      return res.status(409).json({ erro: 'Dispositivo já está pareado' });
    }

    if (dispositivo.pair_code_hash) {
      if (!pair_code) {
        return res.status(400).json({ erro: 'pair_code obrigatório' });
      }

      const ok = await bcrypt.compare(pair_code, dispositivo.pair_code_hash);

      const expirado =
        dispositivo.pair_code_expires_at &&
        new Date(dispositivo.pair_code_expires_at) < new Date();

      if (!ok || dispositivo.pair_code_used || expirado) {
        return res.status(403).json({
          erro: 'Pair code inválido ou expirado'
        });
      }
    }

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
      return res.status(409).json({
        erro:
          'Falha ao parear: dispositivo pode ter sido pareado por outro usuário',
        detalhe: updErr.message
      });
    }

    return res.json({
      mensagem: 'Pareado com sucesso',
      dispositivo: updated
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno ao pareamento',
      detalhe: e?.message
    });
  }
}

/**
 * GET /device/by-assistido/:id
 */
export async function getDeviceByAssistido(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const assistidoId = req.params.id;
    if (!assistidoId) return res.status(400).json({ erro: 'assistido id requerido' });

    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', assistidoId)
      .limit(1)
      .maybeSingle();

    if (vincErr) return res.status(500).json({ erro: 'Falha ao verificar vínculo', detalhe: vincErr.message });
    if (!vinculo) return res.status(403).json({ erro: 'Você não está vinculado a esse assistido' });

    const { data: dispositivo, error: dErr } = await supabaseAdmin
      .from('dispositivos')
      .select('id, codigo_esp, codigo_curto, assistido_id, paired_at, last_seen, nome, firmware_version')
      .eq('assistido_id', assistidoId)
      .limit(1)
      .maybeSingle();

    if (dErr) return res.status(500).json({ erro: 'Erro ao buscar dispositivo', detalhe: dErr.message });

    return res.json({ dispositivo: dispositivo ?? null });
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e?.message });
  }
}

/**
 * POST /device/event
 */
export async function registrarEventoDispositivo(req: Request, res: Response) {
  try {
    const device = (req as any).device;
    if (!device) {
      return res.status(401).json({ erro: 'Dispositivo não autenticado' });
    }

    if (!device.assistido_id) {
      return res.status(400).json({
        erro: 'Dispositivo não pareado — vincule antes de usar.'
      });
    }

    const {
      event_id = null,
      source_timestamp = null,
      event_type = 'queda',
      eixo_x = null,
      eixo_y = null,
      eixo_z = null,
      totalacc = null,
      raw_payload = null
    } = req.body;

    if (event_id) {
      const { data: exists } = await supabaseAdmin
        .from('hist_quedas')
        .select('id')
        .eq('event_id', event_id)
        .limit(1)
        .maybeSingle();

      if (exists) {
        return res.status(200).json({
          ok: true,
          mensagem: 'Evento já registrado'
        });
      }
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('hist_quedas')
      .insert({
        event_id,
        source_timestamp,
        event_type,
        eixo_x,
        eixo_y,
        eixo_z,
        totalacc,
        raw_payload,
        dispositivo_id: device.id,
        assistido_id: device.assistido_id
      })
      .select('*')
      .single();

    if (insErr) {
      return res.status(500).json({
        erro: 'Falha ao registrar evento',
        detalhe: insErr.message
      });
    }

    await supabaseAdmin
      .from('dispositivos')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', device.id);

    console.log(`[Queda] Buscando cuidadores para assistido: ${device.assistido_id}`);

    // 🔥 CORREÇÃO AQUI → variáveis declaradas ANTES do bloco
    let notificacoesEnviadas = 0;
    let notificacoesFalhas = 0;

    const { data: vinculos, error: vErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('usuario_id')
      .eq('assistido_id', device.assistido_id);

    if (!vErr && vinculos && vinculos.length > 0) {
      const usuarioIds = vinculos.map(v => v.usuario_id);

      const { data: usuarios, error: uErr } = await supabaseAdmin
        .from('usuarios')
        .select('id, nome_completo, expo_push_token')
        .in('id', usuarioIds)
        .not('expo_push_token', 'is', null);

      if (!uErr && usuarios && usuarios.length > 0) {
        for (const usuario of usuarios) {
          try {
            if (!usuario.expo_push_token || !usuario.expo_push_token.startsWith('ExponentPushToken')) {
              notificacoesFalhas++;
              continue;
            }

            const pushBody = {
              to: usuario.expo_push_token,
              sound: 'default',
              title: '🚨 QUEDA DETECTADA!',
              body: 'Alerta: Queda detectada no assistido monitorado. Verifique imediatamente!',
              data: {
                assistido_id: device.assistido_id,
                evento_id: inserted.id,
                tipo: 'queda',
                timestamp: new Date().toISOString()
              },
              priority: 'high',
              channelId: 'alertas',
              ttl: 3600,
              _displayInForeground: true
            };

            const response = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(pushBody)
            });

            const result = await response.json();

            if (result.data?.status === 'ok') {
              notificacoesEnviadas++;
            } else {
              notificacoesFalhas++;
            }
          } catch {
            notificacoesFalhas++;
          }
        }
      }
    }

    return res.status(201).json({
      ok: true,
      evento: inserted,
      notificacoes: {
        enviadas: notificacoesEnviadas,
        falhas: notificacoesFalhas
      }
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno ao registrar evento',
      detalhe: e?.message
    });
  }
}

/**
 * POST /device/heartbeat
 */
export async function heartbeatDispositivo(req: Request, res: Response) {
  try {
    const device = (req as any).device;
    if (!device) {
      return res.status(401).json({ erro: 'Dispositivo não autenticado' });
    }

    await supabaseAdmin
      .from('dispositivos')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', device.id);

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno heartbeat',
      detalhe: e?.message
    });
  }
}

/**
 * GET /device/status
 */
export async function deviceStatus(req: Request, res: Response) {
  try {
    const device = (req as any).device;
    if (!device) {
      return res.status(401).json({ erro: 'Dispositivo não autenticado' });
    }

    const { data: devFresh, error: devErr } = await supabaseAdmin
      .from('dispositivos')
      .select(`
        id,
        codigo_esp,
        codigo_curto,
        assistido_id,
        paired_at,
        last_seen,
        nome,
        firmware_version
      `)
      .eq('id', device.id)
      .limit(1)
      .maybeSingle();

    if (devErr) {
      return res.status(500).json({
        erro: 'Erro ao buscar status do dispositivo',
        detalhe: devErr.message
      });
    }

    if (!devFresh) {
      return res.status(404).json({
        erro: 'Dispositivo não encontrado'
      });
    }

    return res.json({
      pareado: !!devFresh.assistido_id,
      assistido_id: devFresh.assistido_id || null,
      codigo_esp: devFresh.codigo_esp,
      codigo_curto: devFresh.codigo_curto,
      paired_at: devFresh.paired_at || null,
      last_seen: devFresh.last_seen || null,
      nome: devFresh.nome || null,
      firmware_version: devFresh.firmware_version || null
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno device status',
      detalhe: e?.message
    });
  }
}

/**
 * POST /device/unpair
 */
export async function unpairDevice(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const { codigo_esp, codigo_curto } = req.body;

    if (!codigo_curto && !codigo_esp) {
      return res.status(400).json({
        erro: 'Envie codigo_curto OU codigo_esp'
      });
    }

    let query = supabaseAdmin.from('dispositivos').select('*').limit(1);
    if (codigo_curto) query = query.eq('codigo_curto', codigo_curto);
    else query = query.eq('codigo_esp', codigo_esp);

    const { data: dispositivo, error: dErr } = await query.maybeSingle();

    if (dErr) {
      return res.status(500).json({
        erro: 'Erro ao buscar dispositivo',
        detalhe: dErr.message
      });
    }

    if (!dispositivo) {
      return res.status(404).json({
        erro: 'Dispositivo não encontrado'
      });
    }

    if (!dispositivo.assistido_id) {
      return res.status(400).json({
        erro: 'Dispositivo não está pareado'
      });
    }

    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', dispositivo.assistido_id)
      .limit(1)
      .maybeSingle();

    if (vincErr) {
      return res.status(500).json({
        erro: 'Erro ao verificar vínculo',
        detalhe: vincErr.message
      });
    }

    if (!vinculo) {
      return res.status(403).json({
        erro: 'Você não tem permissão para desvincular este dispositivo'
      });
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('dispositivos')
      .update({
        assistido_id: null,
        paired_by: null,
        paired_at: null
      })
      .eq('id', dispositivo.id)
      .select('*')
      .single();

    if (updErr) {
      return res.status(500).json({
        erro: 'Falha ao desvincular dispositivo',
        detalhe: updErr.message
      });
    }

    return res.json({
      mensagem: 'Dispositivo desvinculado com sucesso',
      dispositivo: updated
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno unpair',
      detalhe: e?.message
    });
  }
}

/**
 * GET /assistidos/:id/quedas
 */
export async function listarQuedasAssistido(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const assistidoId = req.params.id;
    if (!assistidoId) {
      return res.status(400).json({ erro: 'assistido id requerido' });
    }

    const { data: vinculo, error: vincErr } = await supabaseAdmin
      .from('usuarios_assistidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('assistido_id', assistidoId)
      .limit(1)
      .maybeSingle();

    if (vincErr) {
      return res.status(500).json({
        erro: 'Erro ao verificar vínculo',
        detalhe: vincErr.message
      });
    }

    if (!vinculo) {
      return res.status(403).json({
        erro: 'Você não está vinculado a esse assistido'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
    const offset = (page - 1) * pageSize;

    const { data: quedas, error: qErr } = await supabaseAdmin
      .from('hist_quedas')
      .select(`
        id,
        created_at,
        event_id,
        source_timestamp,
        event_type,
        eixo_x,
        eixo_y,
        eixo_z,
        totalacc,
        raw_payload,
        dispositivo_id
      `)
      .eq('assistido_id', assistidoId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (qErr) {
      return res.status(500).json({
        erro: 'Erro ao listar quedas',
        detalhe: qErr.message
      });
    }

    return res.json({
      page,
      pageSize,
      items: quedas || []
    });
  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno listar quedas',
      detalhe: e?.message
    });
  }
}

/**
 * POST /usuarios/atualizar-token-push
 */
export async function atualizarTokenPush(req: ReqWithUser, res: Response) {
  try {
    const usuarioId = req.usuarioId;
    const { expo_push_token } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    if (!expo_push_token) {
      return res.status(400).json({ erro: "expo_push_token é obrigatório" });
    }

    console.log(`[TokenPush] Atualizando token para usuário ${usuarioId}: ${expo_push_token.substring(0, 20)}...`);

    const { data: updated, error } = await supabaseAdmin
      .from("usuarios")
      .update({ expo_push_token })
      .eq("id", usuarioId)
      .select("id, nome_completo, expo_push_token")
      .single();

    if (error) {
      console.error('[TokenPush] Erro ao atualizar:', error);
      return res.status(500).json({
        erro: "Falha ao atualizar token push",
        detalhe: error.message,
      });
    }

    return res.json({
      mensagem: "Token push atualizado com sucesso",
      usuario: updated
    });

  } catch (e: any) {
    return res.status(500).json({
      erro: "Erro interno ao atualizar token push",
      detalhe: e?.message,
    });
  }
}
