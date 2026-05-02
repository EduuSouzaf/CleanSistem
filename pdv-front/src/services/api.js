import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api/v1',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o JWT em toda requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('biometria_ativa');
      window.location.reload();
    }
    const data = error.response?.data;
    const msg = data?.message || data?.title || (typeof data === 'string' ? data : null) || 'Erro de conexão com o servidor';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(data)));
  }
);

export default api;
