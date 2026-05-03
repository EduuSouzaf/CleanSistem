import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || error.response?.data || 'Erro de conexão com o servidor';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : 'Erro inesperado'));
  }
);

export default api;
