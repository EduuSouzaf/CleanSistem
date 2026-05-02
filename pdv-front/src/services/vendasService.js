import api from './api';

export const registrarVenda = (data) => api.post('/vendas', data);
export const listarVendas = () => api.get('/vendas');
export const devolverVenda = (id, itens) => api.post(`/vendas/${id}/devolucao`, { itens });
