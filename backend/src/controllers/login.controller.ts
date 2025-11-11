import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Função responsável por autenticar um usuário existente
export async function loginUsuario(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    // Verifica se os campos obrigatórios foram enviados
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe email e senha.' });
    }

    // Usa o Supabase para autenticar o usuário
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: senha,
    });

    // Se der erro (usuário não encontrado, senha errada, etc.)
    if (error || !data?.user) {
      return res.status(401).json({ erro: 'Credenciais inválidas.', detalhe: error?.message });
    }

    // Retorna o token JWT e os dados básicos do usuário
    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token: data.session?.access_token,
      usuario: {
        id: data.user.id,
        email: data.user.email,
      },
    });

  } catch (e: any) {
    console.error('Erro ao fazer login:', e.message);
    return res.status(500).json({ erro: 'Erro interno ao tentar logar.', detalhe: e?.message });
  }
}
