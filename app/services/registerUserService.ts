import { supabase } from "../lib/supabaseClient";

interface RegisterData {
  nome_completo: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  senha: string;
}

export async function registerUser(data: RegisterData) {
  const { email, senha } = data;

  // 1) Criar usuário no Supabase Auth
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (signupError) {
    throw new Error(signupError.message || "Erro ao criar usuário");
  }

  return signupData;
}