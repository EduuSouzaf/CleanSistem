import api from './api';

export const getProdutos = () => api.get('/produtos');
export const createProduto = (data) => api.post('/produtos', data);
export const updateProduto = (id, data) => api.put(`/produtos/${id}`, data);
export const deleteProduto = (id) => api.delete(`/produtos/${id}`);
