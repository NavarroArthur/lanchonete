# Guia de deploy — Lanchonete

Stack: Django + DRF no Railway (backend + banco), Vercel (frontend React).
Custo estimado: R$ 0 nos primeiros meses (ambos têm plano gratuito generoso).

---

## Parte 1 — Preparação do código

### 1.1 Variáveis de ambiente para produção

Crie o arquivo `backend/.env.production` (nunca suba para o git):

```
SECRET_KEY=gere-uma-chave-com-o-comando-abaixo
DEBUG=False
ALLOWED_HOSTS=seu-app.railway.app
DB_NAME=railway          ← Railway preenche automaticamente
DB_USER=postgres         ← Railway preenche automaticamente
DB_PASSWORD=...          ← Railway preenche automaticamente
DB_HOST=...              ← Railway preenche automaticamente
DB_PORT=5432
CORS_ORIGINS=https://seu-app.vercel.app
```

Gere a SECRET_KEY com:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 1.2 Arquivo Procfile (Railway usa isso para saber como rodar)

Crie `backend/Procfile`:
```
web: gunicorn config.wsgi --workers 2 --bind 0.0.0.0:$PORT --timeout 120
release: python manage.py migrate
```

O comando `release` roda as migrations automaticamente a cada deploy.

### 1.3 Arquivo .gitignore

Crie `backend/.gitignore`:
```
.env
.env.*
.venv/
venv/
__pycache__/
*.pyc
*.pyo
staticfiles/
media/
db.sqlite3
```

Crie `frontend/.gitignore`:
```
node_modules/
dist/
.env
.env.*
```

### 1.4 Repositório Git

Se ainda não tem repositório:
```bash
cd lanchonete
git init
git add .
git commit -m "chore: setup inicial"
```

Crie um repositório no GitHub (github.com → New repository) e suba:
```bash
git remote add origin https://github.com/seu-usuario/lanchonete.git
git branch -M main
git push -u origin main
```

---

## Parte 2 — Deploy do backend no Railway

Railway é a opção mais simples para Django + PostgreSQL juntos.

### 2.1 Criar conta e projeto

1. Acesse railway.app e faça login com GitHub
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Escolha o repositório `lanchonete`
5. Railway vai detectar o projeto automaticamente

### 2.2 Adicionar o banco PostgreSQL

Dentro do projeto no Railway:
1. Clique em **+ New** → **Database** → **Add PostgreSQL**
2. Um banco é criado e linkado ao projeto

As variáveis `DATABASE_URL`, `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` ficam disponíveis automaticamente no ambiente.

### 2.3 Ajustar o settings.py para ler DATABASE_URL

O Railway injeta uma variável `DATABASE_URL` no formato
`postgresql://user:pass@host:port/dbname`. Atualize o `settings.py`:

```python
import dj_database_url   # pip install dj-database-url

DATABASE_URL = config('DATABASE_URL', default=None)
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
```

Adicione ao `requirements.txt`:
```
dj-database-url>=2.1
```

### 2.4 Configurar o Root Directory

No Railway, vá em **Settings** do serviço:
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command**: já está no Procfile

### 2.5 Adicionar variáveis de ambiente

No Railway → seu serviço → aba **Variables**, adicione:
```
SECRET_KEY          = (a chave gerada no passo 1.1)
DEBUG               = False
ALLOWED_HOSTS       = seu-app.railway.app
CORS_ORIGINS        = https://seu-frontend.vercel.app
```

As variáveis do banco (`PGHOST`, `PGDATABASE`, etc.) já estão lá automaticamente.

### 2.6 Criar o superusuário inicial

Após o primeiro deploy bem-sucedido, abra o terminal do Railway:
Railway → seu serviço → aba **Deploy** → botão **Railway Shell** (ou via CLI):

```bash
python manage.py createsuperuser
```

Preencha username, email e senha.

### 2.7 Verificar o deploy

A URL do seu backend vai aparecer na aba **Settings** → **Domains**.
Teste acessando `https://seu-app.railway.app/api/` — deve retornar o DRF browsable API.

---

## Parte 3 — Deploy do frontend no Vercel

### 3.1 Criar conta

Acesse vercel.com e faça login com GitHub.

### 3.2 Importar o projeto

1. Clique em **Add New Project**
2. Importe o repositório `lanchonete`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Variável de ambiente no Vercel

Na tela de configuração (ou depois em **Settings** → **Environment Variables**):
```
VITE_API_URL = https://seu-app.railway.app/api
```

### 3.4 Atualizar o client.js para usar a variável

```javascript
// src/api/client.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})
```

Essa linha já está no arquivo — só confirme que está lá.

### 3.5 Arquivo vercel.json (necessário para React Router)

Crie `frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sem isso, acessar `/pedidos` diretamente vai retornar 404.

### 3.6 Fazer o deploy

Clique em **Deploy**. O Vercel vai buildar e publicar automaticamente.
A URL final vai ser algo como `https://lanchonete-abc123.vercel.app`.

### 3.7 Atualizar o CORS_ORIGINS no Railway

Volte ao Railway → Variables e atualize:
```
CORS_ORIGINS = https://lanchonete-abc123.vercel.app
```

Faça um novo deploy no Railway para aplicar.

---

## Parte 4 — Uploads de imagem (fotos de produto)

Por padrão, arquivos enviados pelo Django ficam no disco do servidor.
No Railway, esse disco é **efêmero** — os arquivos somem a cada deploy.

Para produção, use armazenamento externo. A opção mais simples é o **Cloudflare R2**
(free tier generoso, compatível com S3):

### 4.1 Instalar dependências

```
pip install django-storages[s3] boto3
```

Adicione ao `requirements.txt`.

### 4.2 Configurar no settings.py

```python
if not DEBUG:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_ACCESS_KEY_ID     = config('R2_ACCESS_KEY')
    AWS_SECRET_ACCESS_KEY = config('R2_SECRET_KEY')
    AWS_STORAGE_BUCKET_NAME = config('R2_BUCKET')
    AWS_S3_ENDPOINT_URL   = config('R2_ENDPOINT')  # ex: https://abc123.r2.cloudflarestorage.com
    AWS_S3_CUSTOM_DOMAIN  = config('R2_PUBLIC_URL', default=None)
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/' if AWS_S3_CUSTOM_DOMAIN else ''
```

Adicione as variáveis `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_ENDPOINT`
no Railway.

Para o MVP, você pode temporariamente desabilitar o upload de foto em produção
e usar o Django Admin para gerenciar produtos sem foto, até configurar o R2.

---

## Parte 5 — Deploy contínuo

Após a configuração inicial, o fluxo é simples:

```bash
# faça suas alterações localmente
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

Railway e Vercel detectam o push automaticamente e fazem o deploy.
As migrations rodam automaticamente via o comando `release` no Procfile.

---

## Resumo dos passos em ordem

1. `git init` + repositório no GitHub
2. Railway: criar projeto → adicionar PostgreSQL → configurar variáveis → deploy
3. `python manage.py createsuperuser` via Railway Shell
4. Vercel: importar repo → configurar Root Directory = `frontend` → adicionar `VITE_API_URL`
5. Criar `frontend/vercel.json` com o rewrite do React Router
6. Atualizar `CORS_ORIGINS` no Railway com a URL final do Vercel
7. Testar o fluxo completo: login → criar pedido → concluir

---

## Domínio personalizado (opcional, depois)

Tanto Railway quanto Vercel permitem adicionar domínio próprio gratuitamente:
- Railway → Settings → Domains → Add Custom Domain
- Vercel → Settings → Domains → Add

Você vai precisar apontar os DNS do seu domínio para os servidores deles.
Se comprar um domínio no Registro.br, a configuração é feita no painel do Registro.br → DNS.
