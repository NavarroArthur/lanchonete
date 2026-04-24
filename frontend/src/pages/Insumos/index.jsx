import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarInsumos } from '../../api/insumos'

export default function Insumos() {
  const [insumos, setInsumos] = useState([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const t = setTimeout(() =>
      listarInsumos({ search: busca }).then(r => setInsumos(r.data.results)), 300)
    return () => clearTimeout(t)
  }, [busca])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Insumos</h1>
        <Link to="/insumos/novo" style={{ padding: '8px 16px', background: '#222', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          + Novo insumo
        </Link>
      </div>

      <input placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
        style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: 280 }} />

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            {['Nome', 'Unidade', 'Estoque atual', 'Estoque mín.', 'Custo médio', ''].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {insumos.map(ins => (
            <tr key={ins.id} style={{ borderTop: '1px solid #eee', background: ins.abaixo_do_minimo ? '#fff8f0' : undefined }}>
              <td style={{ padding: '10px 16px' }}>
                {ins.abaixo_do_minimo && <span style={{ color: '#c60', marginRight: 6 }}>⚠</span>}
                {ins.nome}
              </td>
              <td style={{ padding: '10px 16px' }}>{ins.unidade_medida}</td>
              <td style={{ padding: '10px 16px', color: ins.abaixo_do_minimo ? '#c60' : undefined }}>
                {Number(ins.estoque_atual).toFixed(3)}
              </td>
              <td style={{ padding: '10px 16px' }}>{Number(ins.estoque_minimo).toFixed(3)}</td>
              <td style={{ padding: '10px 16px' }}>R$ {Number(ins.custo_medio).toFixed(4)}</td>
              <td style={{ padding: '10px 16px' }}>
                <Link to={`/insumos/${ins.id}`} style={{ fontSize: 13 }}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
