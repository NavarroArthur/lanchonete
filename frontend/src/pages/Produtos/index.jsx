import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProdutos } from '../../api/produtos'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      listarProdutos({ search: busca })
        .then(r => setProdutos(r.data.results))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Produtos</h1>
        <Link to="/produtos/novo" style={{ padding: '8px 16px', background: '#222', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          + Novo produto
        </Link>
      </div>

      <input placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)}
        style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: 280 }} />

      {loading
        ? <p>Carregando...</p>
        : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Categoria</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Preço</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '10px 16px' }}>{p.nome}</td>
                  <td style={{ padding: '10px 16px' }}>{p.categoria_nome}</td>
                  <td style={{ padding: '10px 16px' }}>R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td style={{ padding: '10px 16px' }}>{p.ativo ? 'Ativo' : 'Inativo'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link to={`/produtos/${p.id}`} style={{ fontSize: 13 }}>Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  )
}
