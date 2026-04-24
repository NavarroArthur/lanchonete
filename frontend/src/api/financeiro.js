import api from './client'

export const caixaAtivo     = ()         => api.get('/caixa/ativa/')
export const abrirCaixa     = (data)     => api.post('/caixa/abrir/', data)
export const fecharCaixa    = (data)     => api.post('/caixa/fechar/', data)
export const listarSessoes  = ()         => api.get('/caixa/')
export const lancarDespesa  = (data)     => api.post('/financeiro/', data)
export const listarMovimentacoes = (params) => api.get('/financeiro/', { params })
export const fluxoCaixa     = (params)   => api.get('/financeiro/fluxo/', { params })
