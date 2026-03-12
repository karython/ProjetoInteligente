# Planejador de ideias

Plataforma SaaS educacional para planejamento inteligente de projetos acadêmicos e técnicos.

## Estrutura do Projeto

```
planejador-de-ideias/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Sidebar.jsx
│   │   └── Stepper.jsx
│   ├── layouts/             # Layouts
│   │   └── DashboardLayout.jsx
│   ├── pages/               # Páginas
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewProject.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── Plans.jsx
│   │   └── Profile.jsx
│   ├── services/            # Integrações com API
│   │   └── api.js
│   ├── data/                # Dados mockados (fallback)
│   │   └── mockData.js
│   ├── App.jsx              # Configuração de rotas
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── public/
├── .env                     # Variáveis de ambiente (não commitar)
├── .env.example             # Template do .env
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── API_INTEGRATION.md       # Documentação da API
```

## Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript
- **Vite** - Build tool
- **React Router DOM** - Roteamento
- **TailwindCSS** - Estilização
- **Plus Jakarta Sans** - Tipografia
- **API Backend** - https://projetointeligente.onrender.com

## API Backend

O projeto está integrado com uma API backend hospedada no Render.

**Documentação da API:** https://projetointeligente.onrender.com/docs

**Endpoints principais:**
- Autenticação (login, registro)
- Gerenciamento de usuários
- CRUD de projetos
- CRUD de tarefas
- Sistema de planos

Veja `API_INTEGRATION.md` para detalhes completos da integração.

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env se necessário (a URL da API já está configurada)

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Funcionalidades

### ✅ Implementadas

- Landing Page moderna
- Sistema de autenticação (UI)
- Dashboard com estatísticas e projetos
- Wizard de criação de projeto (4 etapas)
- Página de detalhes do projeto com 5 abas:
  - Backlog de tarefas
  - Estrutura de pastas
  - Checklist técnico
  - Sequência ideal (timeline)
  - Cronograma semanal
- Página de planos (Free e Pro)
- **Página de perfil** com:
  - Edição de informações pessoais
  - Alteração de senha
  - Opção de excluir conta
- **Sistema de logout**
- Layout responsivo
- Animações suaves
- Dados mockados para demonstração

### 🎨 Design

- Paleta de cores azul moderna
- Interface minimalista estilo SaaS
- Componentes reutilizáveis
- Hover effects e transições
- Tipografia hierárquica
- Cards com sombras suaves

## Rotas

- `/` - Landing Page
- `/login` - Login
- `/signup` - Cadastro
- `/dashboard` - Meus Projetos (Dashboard integrado)
- `/new-project` - Wizard de criação
- `/project/:id` - Detalhes do projeto
- `/plans` - Planos e preços
- `/profile` - Meu Perfil (editar dados e senha)

## Status da Integração

✅ **Integrado com API Backend**
- ✅ Sistema de autenticação (login/registro)
- ✅ Gerenciamento de perfil
- ✅ CRUD de projetos
- ✅ Listagem e criação de tarefas
- ✅ Logout com limpeza de token

## Próximas Melhorias

- [ ] Proteção de rotas (redirect se não autenticado)
- [ ] Refresh token automático
- [ ] Upload de arquivos
- [ ] Geração de PDF
- [ ] Sistema de pagamentos (Stripe)
- [ ] Notificações em tempo real
- [ ] Dark mode

## Observações

- Projeto frontend completo e funcional
- Dados mockados para demonstração
- Pronto para integração com backend
- Código organizado e escalável
- Componentes reutilizáveis
