import { createContext, useContext, useEffect, useState } from 'react'
import { me } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setCarregando(false); return }
    me()
      .then(r => setUsuario(r.data))
      .catch(() => localStorage.clear())
      .finally(() => setCarregando(false))
  }, [])

  const isAdmin = usuario?.is_admin === true

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, isAdmin, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
