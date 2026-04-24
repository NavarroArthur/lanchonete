import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarCategoria, criarCategoria, editarCategoria } from '../../api/categorias'

export default function CategoriaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdicao = Boolean(id)
  const [form, setForm] = useState({ nome: '', ordem: 0, ativo: true })

  useEffect(() => {
    if (isEdicao) buscarCategoria(id).then(r => setForm(r.data))
  }, [id])

  const set = campo => e => setForm(f => ({
    ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }))

  const salvar = async e => {
    e.preventDefault()
    if (isEdicao) await editarCategoria(id, form)
    else await criarCategoria(form)
    navigate('/categorias')
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>{isEdicao ? 'Editar categoria' : 'Nova categoria'}</h1>
      <form onSubmit={salvar} style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ fontSize: 13 }}>Nome</span>
          <input value={form.nome} onChange={set('nome')} required
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ fontSize: 13 }}>Ordem de exibição</span>
          <input type="number" value={form.ordem} onChange={set('ordem')}
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <input type="checkbox" checked={form.ativo} onChange={set('ativo')} />
          <span style={{ fontSize: 13 }}>Categoria ativa</span>
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Salvar
          </button>
          <button type="button" onClick={() => navigate('/categorias')}
            style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
