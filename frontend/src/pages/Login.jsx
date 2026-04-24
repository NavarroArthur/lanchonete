import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, me } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { setUsuario } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const set = campo => e => setForm(f => ({ ...f, [campo]: e.target.value }))

  const entrar = async e => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      const { data } = await me()
      setUsuario(data)
      navigate('/')
    } catch {
      setErro('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <form onSubmit={entrar} style={{
        background: '#fff', padding: 40, borderRadius: 12,
        width: 340, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <h1 style={{ marginBottom: 24, fontSize: 22 }}>Lanchonete</h1>

        {erro && (
          <p style={{ color: '#c00', marginBottom: 16, fontSize: 14 }}>{erro}</p>
        )}

        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Usuário</span>
          <input
            value={form.username} onChange={set('username')} required
            style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Senha</span>
          <input
            type="password" value={form.password} onChange={set('password')} required
            style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </label>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '10px', borderRadius: 6,
          background: '#222', color: '#fff', border: 'none',
          fontSize: 15, cursor: 'pointer',
        }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
