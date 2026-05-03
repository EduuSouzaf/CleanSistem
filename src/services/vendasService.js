import api from './api';

export const registrarVenda = (data) => api.post('/vendas', data);
