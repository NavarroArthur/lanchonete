import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'

import Login from './pages/Login'
import PainelPedidos from './pages/Pedidos/Painel'
import NovoPedido from './pages/Pedidos/NovoPedido'
import Categorias from './pages/Categorias/index'
import CategoriaForm from './pages/Categorias/Form'
import Produtos from './pages/Produtos/index'
import ProdutoForm from './pages/Produtos/Form'
import Insumos from './pages/Insumos/index'
import InsumoForm from './pages/Insumos/Form'
import Caixa from './pages/Financeiro/Caixa'
import NovaDespesa from './pages/Financeiro/NovaDespesa'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout><Navigate to="/pedidos" replace /></Layout>} />
          <Route path="/pedidos"     element={<Layout><PainelPedidos /></Layout>} />
          <Route path="/novo-pedido" element={<Layout><NovoPedido /></Layout>} />

          <Route path="/categorias"      element={<Layout><Categorias /></Layout>} />
          <Route path="/categorias/novo" element={<Layout><CategoriaForm /></Layout>} />
          <Route path="/categorias/:id"  element={<Layout><CategoriaForm /></Layout>} />

          <Route path="/produtos"      element={<Layout><Produtos /></Layout>} />
          <Route path="/produtos/novo" element={<Layout><ProdutoForm /></Layout>} />
          <Route path="/produtos/:id"  element={<Layout><ProdutoForm /></Layout>} />

          <Route path="/insumos"      element={<Layout><Insumos /></Layout>} />
          <Route path="/insumos/novo" element={<Layout><InsumoForm /></Layout>} />
          <Route path="/insumos/:id"  element={<Layout><InsumoForm /></Layout>} />

          <Route path="/caixa"       element={<Layout><Caixa /></Layout>} />
          <Route path="/financeiro"  element={<Layout><NovaDespesa /></Layout>} />

          <Route path="*" element={<Navigate to="/pedidos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
