import api from './client'

export const listarInsumos  = (params)   => api.get('/insumos/', { params })
export const buscarInsumo   = (id)       => api.get(`/insumos/${id}/`)
export const criarInsumo    = (data)     => api.post('/insumos/', data)
export const editarInsumo   = (id, data) => api.patch(`/insumos/${id}/`, data)
export const deletarInsumo  = (id)       => api.delete(`/insumos/${id}/`)
export const alertasEstoque = ()         => api.get('/insumos/alertas/')
