import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

/**
 * LOGIN DO USUÁRIO
 * 
 * Autentica via Supabase Auth:
 * 1. Valida email/senha
 * 2. Recebe token + auth_user_id
 * 3. Busca o usuário interno na tabela "usuarios"
 * 4. Retorna:
 *    - token JWT
 *    - dados completos do usuário interno (perfil)
 */
export async function loginUsuario(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios.'
      });
    }

    // -----------------------------------------
    // 1. LOGIN NO SUPABASE AUTH
    // -----------------------------------------
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: senha
    });

    if (authError || !authData?.user || !authData?.session) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos.',
        detalhe: authError?.message
      });
    }

    const supabaseUser = authData.user;
    const token = authData.session.access_token;
    const authUserId = supabaseUser.id;

    // -----------------------------------------
    // 2. BUSCAR USUÁRIO INTERNO NO BANCO
    //    (o middleware fará auto-create se não existir,
    //    mas aqui tentamos buscar para retornar os dados completos)
    // -----------------------------------------
    let usuarioInterno = null;

    const { data: usuarioDb, error: usuarioErr } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (usuarioDb && !usuarioErr) {
      usuarioInterno = usuarioDb;
    } else {
      // -----------------------------------------
      // 3. CRIAR PERFIL INTERNO SE NÃO EXISTIR
      //    (Auto-create, igual ao middleware)
      // -----------------------------------------
      const novoUsuarioPayload: any = {
        auth_user_id: authUserId,
        email: supabaseUser.email,
      };

      // nome vem do metadata do Supabase (se existir)
      if (supabaseUser.user_metadata?.full_name) {
        novoUsuarioPayload.nome_completo = supabaseUser.user_metadata.full_name;
      }

      const { data: created, error: createErr } = await supabaseAdmin
        .from('usuarios')
        .insert(novoUsuarioPayload)
        .select('*')
        .single();

      if (createErr || !created) {
        return res.status(500).json({
          erro: 'Falha ao criar perfil interno',
          detalhe: createErr?.message
        });
      }

      usuarioInterno = created;
    }

    if (!usuarioInterno) {
      return res.status(500).json({
        erro: 'Falha inesperada ao carregar perfil interno.'
      });
    }

    // -----------------------------------------
    // 4. RESPONDER COM PERFIL COMPLETO + TOKEN
    // -----------------------------------------
    return res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuarioInterno.id,                  // ID interno (importante!)
        auth_user_id: usuarioInterno.auth_user_id,
        email: usuarioInterno.email,
        nome_completo: usuarioInterno.nome_completo,
        telefone: usuarioInterno.telefone,
        data_nascimento: usuarioInterno.data_nascimento,
        criado_em: usuarioInterno.criado_em
      }
    });

  } catch (e: any) {
    return res.status(500).json({
      erro: 'Erro interno ao realizar login.',
      detalhe: e?.message
    });
  }
}

