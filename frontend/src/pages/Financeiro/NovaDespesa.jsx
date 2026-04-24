import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lancarDespesa } from '../../api/financeiro'

const CATEGORIAS = ['fornecedor', 'aluguel', 'energia', 'agua', 'folha', 'manutencao', 'outro']

export default function NovaDespesa() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ categoria: '', descricao: '', valor: '', forma_pagamento: 'dinheiro' })

  const set = campo => e => setForm(f => ({ ...f, [campo]: e.target.value }))
  const inputStyle = { display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }

  const salvar = async e => {
    e.preventDefault()
    await lancarDespesa(form)
    navigate('/financeiro')
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Lançar despesa</h1>
      <form onSubmit={salvar} style={{ background: '#fff', padding: 24, borderRadius: 8 }}>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Categoria</span>
          <select value={form.categoria} onChange={set('categoria')} required style={inputStyle}>
            <option value="">Selecione...</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Descrição</span>
          <input value={form.descricao} onChange={set('descricao')} required style={inputStyle} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Valor (R$)</span>
          <input type="number" step="0.01" value={form.valor} onChange={set('valor')} required style={inputStyle} />
        </label>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={{ fontSize: 13 }}>Forma de pagamento</span>
          <select value={form.forma_pagamento} onChange={set('forma_pagamento')} style={inputStyle}>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Salvar
          </button>
          <button type="button" onClick={() => navigate('/financeiro')}
            style={{ padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
