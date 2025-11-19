import api from "../api/axios";

interface RegisterData {
  nome_completo: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  senha: string;
}

export async function registerUser(data: RegisterData) {
  try {
    // ROTA CORRETA DO BACKEND
    const response = await api.post("/register", data);

    return response.data;

  } catch (error: any) {
    if (error.response) {
      const msg =
        error.response.data?.erro ||
        error.response.data?.message ||
        "Erro ao criar usuário";

      throw new Error(msg);
    }

    if (error.request) {
      throw new Error("Erro de conexão com o servidor");
    }

    throw new Error("Erro inesperado ao registrar usuário");
  }
}
