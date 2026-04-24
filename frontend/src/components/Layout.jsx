import { Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../api/auth'

export default function Layout({ children }) {
  const { usuario, isAdmin, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return <div style={{ padding: 40 }}>Carregando...</div>
  if (!usuario) return <Navigate to="/login" state={{ from: location }} replace />

  const navLink = (to, label) => (
    <Link to={to} style={{
      display: 'block', padding: '8px 12px', borderRadius: 6,
      color: location.pathname.startsWith(to) ? '#fff' : '#ccc',
      background: location.pathname.startsWith(to) ? '#444' : 'transparent',
      textDecoration: 'none', fontSize: 14, marginBottom: 2,
    }}>
      {label}
    </Link>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 200, background: '#1a1a1a', padding: '20px 12px',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginBottom: 24, padding: '0 12px' }}>
          Lanchonete
        </div>

        {navLink('/pedidos', 'Pedidos')}
        {navLink('/novo-pedido', '+ Novo pedido')}
        {navLink('/categorias', 'Categorias')}
        {navLink('/produtos', 'Produtos')}
        {navLink('/insumos', 'Insumos')}
        {navLink('/estoque', 'Estoque')}

        {isAdmin && (
          <>
            <div style={{ color: '#666', fontSize: 11, padding: '12px 12px 4px', textTransform: 'uppercase' }}>
              Admin
            </div>
            {navLink('/caixa', 'Caixa')}
            {navLink('/financeiro', 'Financeiro')}
            {navLink('/usuarios', 'Usuários')}
          </>
        )}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ color: '#888', fontSize: 12, padding: '0 12px', marginBottom: 8 }}>
            {usuario.nome_completo || usuario.username}
          </div>
          <button onClick={logout} style={{
            width: '100%', padding: '8px 12px', borderRadius: 6,
            background: 'transparent', color: '#888', border: '1px solid #333',
            cursor: 'pointer', fontSize: 13, textAlign: 'left',
          }}>
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: 32, background: '#f9f9f9', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
