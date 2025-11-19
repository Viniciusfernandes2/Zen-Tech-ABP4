import api from "../api/axios";

interface LoginData {
  email: string;
  senha: string;
}

export async function loginUser(data: LoginData) {
  try {
    // ROTA CORRETA DO BACKEND
    const response = await api.post('/login', data);

    return response.data;

  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.erro || "Erro ao fazer login");
    }
    throw new Error("Erro de conexão com o servidor");
  }
}
