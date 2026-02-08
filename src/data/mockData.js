export const mockProjects = [
  {
    id: 1,
    name: 'Sistema de Gerenciamento Escolar',
    description: 'Plataforma web para gerenciamento de alunos, professores e notas',
    area: 'Educação',
    level: 'Intermediário',
    language: 'JavaScript',
    framework: 'React',
    database: 'MongoDB',
    hosting: 'Vercel',
    deadline: '2026-04-15',
    goal: 'Projeto final da disciplina de Desenvolvimento Web',
    progress: 65,
    status: 'active',
    createdAt: '2026-01-15',
    tasks: [
      { id: 1, title: 'Configurar ambiente de desenvolvimento', completed: true, priority: 'high' },
      { id: 2, title: 'Criar estrutura de pastas do projeto', completed: true, priority: 'high' },
      { id: 3, title: 'Implementar autenticação de usuários', completed: true, priority: 'high' },
      { id: 4, title: 'Desenvolver dashboard principal', completed: false, priority: 'high' },
      { id: 5, title: 'Criar CRUD de alunos', completed: false, priority: 'medium' },
      { id: 6, title: 'Implementar sistema de notas', completed: false, priority: 'medium' },
    ]
  },
  {
    id: 2,
    name: 'API RESTful para E-commerce',
    description: 'Backend completo para sistema de vendas online',
    area: 'E-commerce',
    level: 'Avançado',
    language: 'Python',
    framework: 'Django',
    database: 'PostgreSQL',
    hosting: 'AWS',
    deadline: '2026-03-30',
    goal: 'Portfólio profissional',
    progress: 30,
    status: 'active',
    createdAt: '2026-02-01',
    tasks: [
      { id: 1, title: 'Setup inicial do Django', completed: true, priority: 'high' },
      { id: 2, title: 'Modelagem do banco de dados', completed: true, priority: 'high' },
      { id: 3, title: 'Criar endpoints de produtos', completed: false, priority: 'high' },
      { id: 4, title: 'Implementar carrinho de compras', completed: false, priority: 'medium' },
    ]
  },
  {
    id: 3,
    name: 'App Mobile de Fitness',
    description: 'Aplicativo para rastreamento de exercícios e dieta',
    area: 'Saúde e Bem-estar',
    level: 'Iniciante',
    language: 'JavaScript',
    framework: 'React Native',
    database: 'Firebase',
    hosting: 'Firebase',
    deadline: '2026-05-20',
    goal: 'Aprender desenvolvimento mobile',
    progress: 100,
    status: 'completed',
    createdAt: '2025-12-10',
    tasks: [
      { id: 1, title: 'Setup do React Native', completed: true, priority: 'high' },
      { id: 2, title: 'Criar telas principais', completed: true, priority: 'high' },
      { id: 3, title: 'Integrar com Firebase', completed: true, priority: 'medium' },
      { id: 4, title: 'Implementar tracking de exercícios', completed: true, priority: 'medium' },
    ]
  }
]

export const folderStructure = {
  name: 'projeto-root',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'components', type: 'folder' },
        { name: 'pages', type: 'folder' },
        { name: 'services', type: 'folder' },
        { name: 'utils', type: 'folder' },
        { name: 'App.jsx', type: 'file' },
        { name: 'main.jsx', type: 'file' },
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { name: 'images', type: 'folder' },
        { name: 'index.html', type: 'file' },
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
  ]
}

export const technicalChecklist = [
  { id: 1, title: 'Git configurado', completed: true },
  { id: 2, title: 'Dependências instaladas', completed: true },
  { id: 3, title: 'Variáveis de ambiente configuradas', completed: true },
  { id: 4, title: 'ESLint e Prettier configurados', completed: false },
  { id: 5, title: 'Testes unitários implementados', completed: false },
  { id: 6, title: 'CI/CD configurado', completed: false },
  { id: 7, title: 'Documentação técnica completa', completed: false },
]

export const timeline = [
  { phase: 'Setup e Configuração', week: 'Semana 1', completed: true },
  { phase: 'Desenvolvimento do Backend', week: 'Semanas 2-4', completed: true },
  { phase: 'Desenvolvimento do Frontend', week: 'Semanas 5-7', completed: false },
  { phase: 'Integração e Testes', week: 'Semana 8', completed: false },
  { phase: 'Deploy e Ajustes Finais', week: 'Semana 9', completed: false },
]

export const schedule = {
  weeks: [
    {
      number: 1,
      title: 'Fundamentos e Setup',
      tasks: [
        'Configurar ambiente de desenvolvimento',
        'Criar repositório Git',
        'Definir arquitetura do projeto',
        'Setup de dependências'
      ]
    },
    {
      number: 2,
      title: 'Backend - Autenticação',
      tasks: [
        'Implementar registro de usuários',
        'Criar sistema de login',
        'Configurar JWT',
        'Middleware de autenticação'
      ]
    },
    {
      number: 3,
      title: 'Backend - API Principal',
      tasks: [
        'Criar models do banco',
        'Desenvolver endpoints CRUD',
        'Validação de dados',
        'Tratamento de erros'
      ]
    },
    {
      number: 4,
      title: 'Frontend - Estrutura',
      tasks: [
        'Setup do React',
        'Criar componentes base',
        'Configurar rotas',
        'Implementar layout principal'
      ]
    },
  ]
}
