import api from './client'

export const listarPedidos = (params)    => api.get('/pedidos/', { params })
export const buscarPedido  = (id)        => api.get(`/pedidos/${id}/`)
export const criarPedido   = (data)      => api.post('/pedidos/', data)
export const editarPedido  = (id, data)  => api.patch(`/pedidos/${id}/`, data)
export const avancarPedido = (id)        => api.post(`/pedidos/${id}/avancar/`)
export const concluirPedido = (id, forma_pagamento) =>
  api.post(`/pedidos/${id}/concluir/`, { forma_pagamento })
export const cancelarPedido = (id, motivo) =>
  api.post(`/pedidos/${id}/cancelar/`, { motivo })
