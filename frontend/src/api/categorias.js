import api from './client'

export const listarCategorias = (params) => api.get('/categorias/', { params })
export const buscarCategoria  = (id)     => api.get(`/categorias/${id}/`)
export const criarCategoria   = (data)   => api.post('/categorias/', data)
export const editarCategoria  = (id, data) => api.patch(`/categorias/${id}/`, data)
export const deletarCategoria = (id)     => api.delete(`/categorias/${id}/`)
