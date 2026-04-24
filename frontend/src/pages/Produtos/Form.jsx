import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarProduto, criarProduto, editarProduto } from '../../api/produtos'
import api from '../../api/client'

export default function ProdutoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdicao = Boolean(id)

  const [form, setForm] = useState({ nome: '', descricao: '', preco_venda: '', categoria: '', ativo: true })
  const [foto, setFoto] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [insumos, setInsumos] = useState([])
  const [ficha, setFicha] = useState([])

  useEffect(() => {
    api.get('/categorias/').then(r => setCategorias(r.data.results))
    api.get('/insumos/').then(r => setInsumos(r.data.results))
    if (isEdicao) {
      buscarProduto(id).then(r => {
        const p = r.data
        setForm({ nome: p.nome, descricao: p.descricao, preco_venda: p.preco_venda, categoria: p.categoria, ativo: p.ativo })
        setFicha(p.ficha_tecnica.map(ft => ({ id: ft.id, insumo: ft.insumo, quantidade: ft.quantidade })))
      })
    }
  }, [id])

  const set = campo => e => setForm(f => ({
    ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }))

  const adicionarInsumo = () => setFicha(p => [...p, { insumo: '', quantidade: '' }])
  const removerInsumo = i => setFicha(p => p.filter((_, idx) => idx !== i))
  const atualizarFicha = (i, campo, valor) =>
    setFicha(p => p.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item))

  const salvar = async e => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (foto) formData.append('foto', foto)

    const res = isEdicao ? await editarProduto(id, formData) : await criarProduto(formData)
    const produtoId = res.data.id

    await Promise.all(ficha.filter(ft => ft.id).map(ft =>
      api.delete(`/ficha-tecnica/${ft.id}/`)
    ))
    await Promise.all(
      ficha.filter(ft => ft.insumo && ft.quantidade).map(ft =>
        api.post('/ficha-tecnica/', { produto: produtoId, insumo: ft.insumo, quantidade: ft.quantidade })
      )
    )
    navigate('/produtos')
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>{isEdicao ? 'Editar produto' : 'Novo produto'}</h1>
      <form onSubmit={salvar} style={{ background: '#fff', padding: 24, borderRadius: 8 }}>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Nome</span>
          <input value={form.nome} onChange={set('nome')} required
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Categoria</span>
          <select value={form.categoria} onChange={set('categoria')} required
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}>
            <option value="">Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Preço de venda (R$)</span>
          <input type="number" step="0.01" value={form.preco_venda} onChange={set('preco_venda')} required
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Descrição</span>
          <textarea value={form.descricao} onChange={set('descricao')} rows={3}
            style={{ display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Foto</span>
          <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])}
            style={{ display: 'block', marginTop: 4 }} />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <input type="checkbox" checked={form.ativo} onChange={set('ativo')} />
          <span style={{ fontSize: 13 }}>Produto ativo</span>
        </label>

        <hr style={{ margin: '20px 0' }} />
        <h3 style={{ marginBottom: 12 }}>Ficha técnica</h3>

        {ficha.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <select value={item.insumo} onChange={e => atualizarFicha(i, 'insumo', e.target.value)}
              style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd' }}>
              <option value="">Selecione o insumo...</option>
              {insumos.map(ins => <option key={ins.id} value={ins.id}>{ins.nome} ({ins.unidade_medida})</option>)}
            </select>
            <input type="number" step="0.001" placeholder="Qtd" value={item.quantidade}
              onChange={e => atualizarFicha(i, 'quantidade', e.target.value)}
              style={{ width: 90, padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd' }} />
            <button type="button" onClick={() => removerInsumo(i)}
              style={{ color: '#c00', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        ))}

        <button type="button" onClick={adicionarInsumo}
          style={{ marginBottom: 20, padding: '6px 14px', borderRadius: 6, border: '1px dashed #aaa', background: 'none', cursor: 'pointer', fontSize: 13 }}>
          + Adicionar insumo
        </button>

        <hr style={{ margin: '20px 0' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Salvar
          </button>
          <button type="button" onClick={() => navigate('/produtos')}
            style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
