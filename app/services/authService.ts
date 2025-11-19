// src/services/authService.ts
import api, { 
  saveAuthToken, 
  saveUserProfile,
  clearAuth            // ⭐ FALTAVA ISSO
} from '../api/axios';

export interface LoginResponse {
  token: string;
  usuario: any;
}

export async function loginUserApi(email: string, senha: string): Promise<LoginResponse> {
  // backend: POST /api/login
  const resp = await api.post('/login', { email, senha }); 
  const data = resp.data;

  // o backend retorna { mensagem, token, usuario }
  const token = data.token 
             ?? data?.session?.access_token 
             ?? data?.token;

  const usuario = data.usuario 
               ?? data?.usuario 
               ?? data?.user;

  if (!token) throw new Error('Token não recebido do servidor');

  // salva token e perfil
  await saveAuthToken(token);

  if (usuario) {
    await saveUserProfile(JSON.stringify(usuario));
  }

  return { token, usuario };
}

export async function registerUserApi(payload: any) {
  const resp = await api.post('/register', payload);
  return resp.data;
}

export async function logout() {
  await clearAuth();    // ⭐ AGORA FUNCIONA
}
