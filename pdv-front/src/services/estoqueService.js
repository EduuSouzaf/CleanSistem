import api from './api';

export const registrarEntrada = (data) => api.post('/estoque/entrada', data);
