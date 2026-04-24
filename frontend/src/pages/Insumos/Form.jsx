import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarInsumo, criarInsumo, editarInsumo } from '../../api/insumos'

const UNIDADES = [
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g',  label: 'Grama (g)' },
  { value: 'l',  label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'un', label: 'Unidade (un)' },
]

export default function InsumoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdicao = Boolean(id)
  const [form, setForm] = useState({ nome: '', unidade_medida: 'un', estoque_minimo: '0', custo_medio: '0' })

  useEffect(() => {
    if (isEdicao) buscarInsumo(id).then(r => setForm(r.data))
  }, [id])

  const set = campo => e => setForm(f => ({ ...f, [campo]: e.target.value }))

  const salvar = async e => {
    e.preventDefault()
    if (isEdicao) await editarInsumo(id, form)
    else await criarInsumo(form)
    navigate('/insumos')
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>{isEdicao ? 'Editar insumo' : 'Novo insumo'}</h1>
      <form onSubmit={salvar} style={{ background: '#fff', padding: 24, borderRadius: 8 }}>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Nome</span>
          <input value={form.nome} onChange={set('nome')} required
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Unidade de medida</span>
          <select value={form.unidade_medida} onChange={set('unidade_medida')}
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}>
            {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Estoque mínimo</span>
          <input type="number" step="0.001" value={form.estoque_minimo} onChange={set('estoque_minimo')}
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={{ fontSize: 13 }}>Custo médio (R$)</span>
          <input type="number" step="0.0001" value={form.custo_medio} onChange={set('custo_medio')}
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Salvar
          </button>
          <button type="button" onClick={() => navigate('/insumos')}
            style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
