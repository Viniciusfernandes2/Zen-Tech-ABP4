import api from "../api/axios";

interface RegisterData {
  nome_completo: string;
  data_nascimento: string;
  observacoes: string;
  telefone_1: string;
  telefone_2: string;
}

export async function registerUser(data: RegisterData) {
  try {
    const response = await api.post("/assistidos", data);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao registrar usuário:", error.response?.data || error.message);
    throw error.response?.data || { message: "Erro ao registrar usuário" };
  }
}