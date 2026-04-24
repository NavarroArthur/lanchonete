import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarCategorias, deletarCategoria } from '../../api/categorias'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])

  const carregar = () =>
    listarCategorias().then(r => setCategorias(r.data.results))

  useEffect(() => { carregar() }, [])

  const excluir = async (id, nome) => {
    if (!confirm(`Excluir categoria "${nome}"?`)) return
    try {
      await deletarCategoria(id)
      carregar()
    } catch {
      alert('Não é possível excluir: existem produtos nessa categoria.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Categorias</h1>
        <Link to="/categorias/novo" style={{ padding: '8px 16px', background: '#222', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          + Nova categoria
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '10px 16px', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '10px 16px', textAlign: 'left' }}>Ordem</th>
            <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '10px 16px' }}></th>
          </tr>
        </thead>
        <tbody>
          {categorias.map(c => (
            <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '10px 16px' }}>{c.nome}</td>
              <td style={{ padding: '10px 16px' }}>{c.ordem}</td>
              <td style={{ padding: '10px 16px' }}>{c.ativo ? 'Ativa' : 'Inativa'}</td>
              <td style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
                <Link to={`/categorias/${c.id}`} style={{ fontSize: 13 }}>Editar</Link>
                <button onClick={() => excluir(c.id, c.nome)} style={{ fontSize: 13, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
