import api from './client'

export const listarProdutos  = (params)    => api.get('/produtos/', { params })
export const buscarProduto   = (id)        => api.get(`/produtos/${id}/`)
export const criarProduto    = (data)      => api.post('/produtos/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const editarProduto   = (id, data)  => api.patch(`/produtos/${id}/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const deletarProduto  = (id)        => api.delete(`/produtos/${id}/`)
