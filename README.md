# Project Booster

Plataforma SaaS educacional para planejamento inteligente de projetos acadêmicos e técnicos.

## Estrutura do Projeto

```
project-booster/
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
│   ├── data/                # Dados mockados
│   │   └── mockData.js
│   ├── App.jsx              # Configuração de rotas
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript
- **Vite** - Build tool
- **React Router DOM** - Roteamento
- **TailwindCSS** - Estilização
- **Plus Jakarta Sans** - Tipografia

## Instalação

```bash
# Instalar dependências
npm install

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

## Próximos Passos (Backend)

- Integração com API
- Autenticação real (JWT)
- Persistência de dados
- Geração de planejamento com IA
- Exportação PDF
- Sistema de pagamentos

## Observações

- Projeto frontend completo e funcional
- Dados mockados para demonstração
- Pronto para integração com backend
- Código organizado e escalável
- Componentes reutilizáveis
