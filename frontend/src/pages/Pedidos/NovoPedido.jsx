import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { criarPedido } from '../../api/pedidos'
import api from '../../api/client'

export default function NovoPedido() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [tipo, setTipo] = useState('retirada')
  const [cliente, setCliente] = useState({ nome: '', telefone: '', endereco: '' })
  const [itens, setItens] = useState([])
  const [busca, setBusca] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const t = setTimeout(() =>
      api.get('/produtos/', { params: { ativo: true, search: busca } })
        .then(r => setProdutos(r.data.results)), 300)
    return () => clearTimeout(t)
  }, [busca])

  const setCliente_ = campo => e => setCliente(c => ({ ...c, [campo]: e.target.value }))

  const adicionarItem = produto => {
    setItens(prev => {
      const existe = prev.find(i => i.produto.id === produto.id)
      if (existe) return prev.map(i =>
        i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
      )
      return [...prev, { produto, quantidade: 1, observacao: '' }]
    })
  }

  const removerItem = produtoId =>
    setItens(prev => prev.filter(i => i.produto.id !== produtoId))

  const setObservacao = (produtoId, obs) =>
    setItens(prev => prev.map(i => i.produto.id === produtoId ? { ...i, observacao: obs } : i))

  const total = itens.reduce((acc, i) => acc + Number(i.produto.preco_venda) * i.quantidade, 0)

  const enviar = async () => {
    if (!itens.length) return
    setEnviando(true)
    try {
      await criarPedido({
        tipo,
        origem: 'interno',
        cliente_nome: cliente.nome,
        cliente_telefone: cliente.telefone,
        cliente_endereco: tipo === 'delivery' ? cliente.endereco : '',
        itens: itens.map(i => ({
          produto: i.produto.id,
          quantidade: i.quantidade,
          observacao: i.observacao,
        })),
      })
      navigate('/pedidos')
    } catch {
      alert('Erro ao criar pedido.')
      setEnviando(false)
    }
  }

  const inputStyle = { display: 'block', width: '100%', padding: '8px 10px', marginTop: 4, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Novo pedido</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        {/* Seleção de produtos */}
        <div>
          <input placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)}
            style={{ ...inputStyle, marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {produtos.map(p => (
              <button key={p.id} onClick={() => adicionarItem(p)} style={{
                textAlign: 'left', padding: 12, borderRadius: 8, border: '1px solid #e0e0e0',
                background: '#fff', cursor: 'pointer',
              }}>
                {p.foto && <img src={p.foto} alt={p.nome} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 6 }} />}
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.nome}</div>
                <div style={{ fontSize: 13, color: '#555' }}>R$ {Number(p.preco_venda).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, position: 'sticky', top: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Pedido</h3>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontSize: 13 }}>Tipo</span>
            <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inputStyle }}>
              <option value="retirada">Retirada no local</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>Nome do cliente</span>
            <input value={cliente.nome} onChange={setCliente_('nome')} style={inputStyle} />
          </label>

          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>Telefone</span>
            <input value={cliente.telefone} onChange={setCliente_('telefone')} style={inputStyle} />
          </label>

          {tipo === 'delivery' && (
            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>Endereço</span>
              <textarea value={cliente.endereco} onChange={setCliente_('endereco')} rows={2} style={inputStyle} />
            </label>
          )}

          <hr style={{ margin: '14px 0' }} />

          {itens.length === 0
            ? <p style={{ color: '#aaa', fontSize: 13 }}>Nenhum item.</p>
            : itens.map(item => (
              <div key={item.produto.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>{item.quantidade}× {item.produto.nome}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>R$ {(Number(item.produto.preco_venda) * item.quantidade).toFixed(2)}</span>
                    <button onClick={() => removerItem(item.produto.id)}
                      style={{ color: '#c00', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                </div>
                <input placeholder="Observação (ex: sem cebola)" value={item.observacao}
                  onChange={e => setObservacao(item.produto.id, e.target.value)}
                  style={{ width: '100%', padding: '4px 8px', marginTop: 4, border: '1px solid #eee', borderRadius: 4, fontSize: 12, boxSizing: 'border-box' }} />
              </div>
            ))
          }

          <hr style={{ margin: '14px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 16 }}>
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          <button onClick={enviar} disabled={!itens.length || enviando} style={{
            width: '100%', padding: 12, borderRadius: 6,
            background: itens.length ? '#222' : '#ccc',
            color: '#fff', border: 'none', cursor: itens.length ? 'pointer' : 'not-allowed',
            fontSize: 15,
          }}>
            {enviando ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
