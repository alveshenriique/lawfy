import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Lawfy:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isShowingConnectionError = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('@Lawfy:token');
      localStorage.removeItem('@Lawfy:user');
      window.location.href = '/';
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (error.response?.status === 500) {
      toast.error('Erro interno do servidor. Tente novamente.');
    } else if (error.response?.status === 404) {
      toast.error('Registro não encontrado.');
    } else if (!error.response && !isShowingConnectionError) {
      isShowingConnectionError = true;
      toast.error('Sem conexão com o servidor. Verifique sua internet.', {
        duration: 5000,
      });
      setTimeout(() => {
        isShowingConnectionError = false;
      }, 5000);
    }

    return Promise.reject(error);
  }
);