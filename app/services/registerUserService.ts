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
    console.log('Passou aqui 1');
    const response = await api.post('/cuidadores', data);
    console.log('Passou aqui 2');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.erro || 'Erro ao criar usuário');
    }
    throw new Error('Erro de conexão com o servidor');
  }
}