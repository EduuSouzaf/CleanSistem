import api from './api';

export const getVendasDia = () => api.get('/relatorios/vendas-dia');
export const getEstoque = () => api.get('/relatorios/estoque');
export const getProdutosParados = () => api.get('/relatorios/produtos-parados');
