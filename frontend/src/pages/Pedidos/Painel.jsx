import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarPedidos, avancarPedido, concluirPedido, cancelarPedido } from '../../api/pedidos'

const COLUNAS = [
  { key: 'aguardando',   label: 'Aguardando' },
  { key: 'confirmado',   label: 'Confirmado' },
  { key: 'em_preparo',   label: 'Em preparo' },
  { key: 'pronto',       label: 'Pronto' },
  { key: 'saiu_entrega', label: 'Saiu p/ entrega' },
]

const CORES_STATUS = {
  aguardando:   '#fff8e1',
  confirmado:   '#e8f5e9',
  em_preparo:   '#e3f2fd',
  pronto:       '#f3e5f5',
  saiu_entrega: '#fce4ec',
}

export default function PainelPedidos() {
  const [pedidos, setPedidos] = useState([])

  const carregar = () =>
    listarPedidos({ page_size: 100 }).then(r => setPedidos(r.data.results))

  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 30000)
    return () => clearInterval(t)
  }, [])

  const ativos = pedidos.filter(p =>
    ['aguardando', 'confirmado', 'em_preparo', 'pronto', 'saiu_entrega'].includes(p.status)
  )

  const handleAvancar = async id => {
    await avancarPedido(id)
    carregar()
  }

  const handleConcluir = async (id) => {
    const forma = prompt('Forma de pagamento:\n  dinheiro\n  cartao\n  pix')
    if (!forma) return
    try {
      await concluirPedido(id, forma)
      carregar()
    } catch (e) {
      alert(e.response?.data?.erro || 'Erro ao concluir pedido.')
    }
  }

  const handleCancelar = async id => {
    const motivo = prompt('Motivo do cancelamento:')
    if (motivo === null) return
    await cancelarPedido(id, motivo)
    carregar()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Painel de pedidos</h1>
        <Link to="/novo-pedido" style={{ padding: '8px 16px', background: '#222', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          + Novo pedido
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'flex-start' }}>
        {COLUNAS.map(col => (
          <div key={col.key} style={{ minWidth: 220, flex: '0 0 220px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', color: '#666', letterSpacing: 1 }}>
              {col.label}
              <span style={{ marginLeft: 6, background: '#eee', borderRadius: 10, padding: '1px 7px', fontSize: 12 }}>
                {ativos.filter(p => p.status === col.key).length}
              </span>
            </h3>

            {ativos.filter(p => p.status === col.key).map(p => (
              <div key={p.id} style={{
                background: CORES_STATUS[p.status] || '#fff',
                border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>#{p.numero}</strong>
                  <span style={{ fontSize: 12, color: '#888' }}>
                    {p.tipo === 'delivery' ? '🛵 Delivery' : '🏠 Retirada'}
                  </span>
                </div>

                {p.cliente_nome && (
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{p.cliente_nome}</div>
                )}

                <ul style={{ margin: '6px 0', padding: '0 0 0 16px', fontSize: 12 }}>
                  {p.itens.map(it => (
                    <li key={it.id}>{it.quantidade}x {it.produto_nome}
                      {it.observacao && <span style={{ color: '#888' }}> — {it.observacao}</span>}
                    </li>
                  ))}
                </ul>

                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                  R$ {Number(p.valor_total).toFixed(2)}
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {!p.pode_concluir && (
                    <button onClick={() => handleAvancar(p.id)} style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 4,
                      background: '#222', color: '#fff', border: 'none', cursor: 'pointer',
                    }}>
                      Avançar →
                    </button>
                  )}
                  {p.pode_concluir && (
                    <button onClick={() => handleConcluir(p.id)} style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 4,
                      background: '#2e7d32', color: '#fff', border: 'none', cursor: 'pointer',
                    }}>
                      Concluir
                    </button>
                  )}
                  <button onClick={() => handleCancelar(p.id)} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 4,
                    background: '#fff', color: '#c00', border: '1px solid #fcc', cursor: 'pointer',
                  }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ))}

            {ativos.filter(p => p.status === col.key).length === 0 && (
              <div style={{ padding: 12, fontSize: 13, color: '#bbb', textAlign: 'center', border: '1px dashed #e0e0e0', borderRadius: 8 }}>
                Vazio
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
