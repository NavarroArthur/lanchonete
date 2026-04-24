import { useEffect, useState } from 'react'
import { caixaAtivo, abrirCaixa, fecharCaixa } from '../../api/financeiro'

const fmt = v => `R$ ${Number(v || 0).toFixed(2)}`

export default function Caixa() {
  const [estado, setEstado] = useState(null)
  const [loading, setLoading] = useState(true)

  const carregar = () =>
    caixaAtivo().then(r => setEstado(r.data)).finally(() => setLoading(false))

  useEffect(() => { carregar() }, [])

  const abrir = async () => {
    const valor = prompt('Valor de abertura (troco inicial em caixa):')
    if (valor === null) return
    try {
      await abrirCaixa({ valor_abertura: parseFloat(valor) || 0 })
      carregar()
    } catch (e) {
      alert(e.response?.data?.erro || 'Erro ao abrir caixa.')
    }
  }

  const fechar = async () => {
    const contado = prompt('Valor contado em dinheiro no caixa agora:')
    if (contado === null) return
    const obs = prompt('Observação (opcional):') || ''
    try {
      await fecharCaixa({ valor_contado: parseFloat(contado), observacao: obs })
      carregar()
    } catch (e) {
      alert(e.response?.data?.erro || 'Erro ao fechar caixa.')
    }
  }

  if (loading) return <p>Carregando...</p>

  if (!estado?.aberto) {
    return (
      <div>
        <h1>Caixa</h1>
        <p style={{ color: '#888', marginBottom: 20 }}>Nenhum caixa aberto no momento.</p>
        <button onClick={abrir} style={{
          padding: '10px 24px', background: '#222', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15,
        }}>
          Abrir caixa
        </button>
      </div>
    )
  }

  const { sessao, resumo } = estado

  const linha = (label, valor, destaque = false, negativo = false) => (
    <tr style={{ borderTop: '1px solid #f0f0f0' }}>
      <td style={{ padding: '10px 0', fontSize: 14 }}>{label}</td>
      <td style={{
        padding: '10px 0', textAlign: 'right', fontWeight: destaque ? 600 : 400,
        color: negativo ? '#c00' : destaque ? '#222' : '#555',
      }}>
        {negativo && valor > 0 ? `- ${fmt(valor)}` : fmt(valor)}
      </td>
    </tr>
  )

  const diferencaPos = resumo.diferenca !== null && resumo.diferenca >= 0

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Caixa</h1>

      <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 20 }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#888' }}>
          Aberto em {new Date(sessao.aberto_em).toLocaleString('pt-BR')} por {sessao.abertura_usuario_nome}
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <tbody>
            {linha('Valor de abertura', resumo.valor_abertura)}
            {linha('Receitas — dinheiro', resumo.receitas?.dinheiro)}
            {linha('Receitas — cartão', resumo.receitas?.cartao)}
            {linha('Receitas — PIX', resumo.receitas?.pix)}
            {linha('Despesas lançadas', resumo.despesas, false, true)}
            <tr style={{ borderTop: '2px solid #e0e0e0' }}>
              <td style={{ padding: '12px 0', fontWeight: 600 }}>Esperado em dinheiro</td>
              <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>
                {fmt(resumo.esperado_dinheiro)}
              </td>
            </tr>
            {resumo.valor_contado !== null && (
              <>
                {linha('Valor contado', resumo.valor_contado)}
                <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 0', fontSize: 14 }}>Diferença</td>
                  <td style={{
                    padding: '10px 0', textAlign: 'right', fontWeight: 600,
                    color: diferencaPos ? '#2e7d32' : '#c00',
                  }}>
                    {resumo.diferenca >= 0 ? '+' : ''}{fmt(resumo.diferenca)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={fechar} style={{
        padding: '10px 24px', background: '#444', color: '#fff',
        border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15,
      }}>
        Fechar caixa
      </button>
    </div>
  )
}
