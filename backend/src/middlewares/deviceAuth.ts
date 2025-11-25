import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { compareDeviceToken } from '../utils/deviceToken';

export interface DeviceAuthRequest extends Request {
  device?: any;
}

export async function deviceAuth(req: DeviceAuthRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Authorization header inválido' });
    }

    const token = auth.slice('Bearer '.length).trim();
    if (!token) return res.status(401).json({ erro: 'Token não informado' });

    // Buscar dispositivo cujo device_token_hash bate (não dá pra procurar pelo token),
    // então buscamos dispositivos com token_revoked = false e checamos compare.
    // Para performance em bancos grandes, você pode armazenar um prefix hash index,
    // mas aqui vamos consultar por device rows plausíveis (codigo_esp ou todos não revogados).
    const { data: devices, error } = await supabaseAdmin
      .from('dispositivos')
      .select('id, codigo_esp, device_token_hash, token_revoked, assistido_id, nome')
      .eq('token_revoked', false)
      .limit(100);

    if (error) {
      return res.status(500).json({ erro: 'Erro ao acessar dispositivos', detalhe: error.message });
    }

    // Compare token com cada hash (normalmente lista pequena). Se sua base crescer muito,
    // considere outra abordagem (ex: armazenar token_id público + hash, ou prefix-index).
    let found: any = null;
    for (const d of devices || []) {
      if (!d.device_token_hash) continue;
      try {
        // compareDeviceToken usa bcrypt.compare internamente
        // eslint-disable-next-line no-await-in-loop
        const match = await compareDeviceToken(token, d.device_token_hash);
        if (match) {
          found = d;
          break;
        }
      } catch (e) {
        // continue
      }
    }

    if (!found) {
      return res.status(401).json({ erro: 'Token do dispositivo inválido ou revogado' });
    }

    // check token_revoked just in case
    if (found.token_revoked) {
      return res.status(403).json({ erro: 'Token do dispositivo revogado' });
    }

    // popula req.device para controllers
    req.device = {
      id: found.id,
      codigo_esp: found.codigo_esp,
      assistido_id: found.assistido_id,
      nome: found.nome
    };

    return next();
  } catch (e: any) {
    return res.status(500).json({ erro: 'Erro ao autenticar dispositivo', detalhe: e?.message });
  }
}
