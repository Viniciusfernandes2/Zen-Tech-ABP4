import api from "../api/axios"; // Mudança no import

interface RegisterData {
  nome_completo: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  senha: string;
}

export async function registerUser(data: RegisterData) {
  const { nome_completo, data_nascimento, telefone, email, senha } = data;

  try {
    // 1) Criar usuário via API backend
    const response = await api.post("/api/register", { // Ajuste a rota conforme sua API
      nome_completo,
      data_nascimento,
      telefone,
      email,
      senha
    });

    return response.data;

  } catch (error: any) {
    // Tratamento de erro específico do axios
    if (error.response) {
      // O servidor respondeu com um status de erro
      const errorMessage = error.response.data?.message || error.response.data?.error || "Erro ao criar usuário";
      throw new Error(errorMessage);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      throw new Error("Erro de conexão com o servidor");
    } else {
      // Algum erro ocorreu durante a configuração da requisição
      throw new Error(error.message || "Erro ao processar requisição");
    }
  }
}