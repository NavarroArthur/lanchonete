import axios from 'axios'
import api from './client'

export const login = async (username, password) => {
  const { data } = await axios.post('/api/auth/login/', { username, password })
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  return data
}

export const logout = () => {
  localStorage.clear()
  window.location.href = '/login'
}

export const me = () => api.get('/usuarios/me/')
