import axios from "axios";

const api = axios.create({
  baseURL: 'https://deploy-bioalert.onrender.com', // Ou seu endereço de produção
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Adicionar interceptor para logging (opcional)
api.interceptors.request.use(
  (config) => {
    console.log('Enviando requisição:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.status);
    return response;
  },
  (error) => {
    console.log('Erro na resposta:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;