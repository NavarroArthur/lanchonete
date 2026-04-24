# Lanchonete — Sistema de gestão

## Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

## Desenvolvimento local

### Backend

```bash
cd backend

# 1. Ambiente virtual
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

# 2. Dependências
pip install -r requirements.txt

# 3. Variáveis de ambiente
cp .env.example .env
# edite o .env com suas credenciais do banco

# 4. Banco de dados (crie o banco antes)
createdb lanchonete               # ou crie pelo pgAdmin

# 5. Migrations
python manage.py makemigrations
python manage.py migrate

# 6. Superusuário
python manage.py createsuperuser

# 7. Servidor
python manage.py runserver
# rodando em http://localhost:8000
```

### Frontend

```bash
cd frontend

npm install
npm run dev
# rodando em http://localhost:5173
```

---

## Estrutura do projeto

```
lanchonete/
├── backend/
│   ├── config/              ← settings, urls, wsgi
│   ├── apps/
│   │   ├── usuarios/        ← auth, permissões
│   │   ├── catalogo/        ← categorias, produtos, insumos, ficha técnica
│   │   ├── pedidos/         ← pedidos, itens, serviço de status
│   │   ├── estoque/         ← movimentações de estoque
│   │   └── financeiro/      ← caixa, movimentações financeiras
│   ├── manage.py
│   ├── requirements.txt
│   └── Procfile             ← usado pelo Railway
└── frontend/
    ├── src/
    │   ├── api/             ← funções de chamada ao backend
    │   ├── components/      ← Layout, componentes reutilizáveis
    │   ├── contexts/        ← AuthContext
    │   └── pages/           ← telas da aplicação
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Endpoints principais

| Método | URL | Descrição |
|--------|-----|-----------|
| POST | /api/auth/login/ | Login → retorna JWT |
| POST | /api/auth/refresh/ | Renova access token |
| GET  | /api/produtos/cardapio/ | Cardápio público (sem auth) |
| GET  | /api/pedidos/?status= | Lista pedidos (filtrável) |
| POST | /api/pedidos/{id}/avancar/ | Avança status do pedido |
| POST | /api/pedidos/{id}/concluir/ | Conclui pedido (baixa estoque + receita) |
| POST | /api/pedidos/{id}/cancelar/ | Cancela pedido |
| GET  | /api/insumos/alertas/ | Insumos abaixo do mínimo |
| GET  | /api/caixa/ativa/ | Status do caixa atual |
| POST | /api/caixa/abrir/ | Abre sessão de caixa |
| POST | /api/caixa/fechar/ | Fecha sessão de caixa |
| GET  | /api/financeiro/fluxo/?inicio=&fim= | Fluxo de caixa por período |

---

## Grupos de permissão

- **administrador**: acesso total, incluindo financeiro e caixa
- **operador**: pedidos, cadastros básicos, estoque — sem acesso financeiro

Crie usuários e atribua grupos pelo Django Admin em `/admin/`.
