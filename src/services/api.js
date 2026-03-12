const API_URL = import.meta.env.VITE_API_URL || 'https://projetointeligente.onrender.com'

// Helper para fazer requisições com retry
const request = async (endpoint, options = {}, retries = 2) => {
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config)
      
      // Tentar parsear como JSON
      let data
      const contentType = response.headers.get('content-type')

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        data = null
      } else if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = text ? { message: text } : null
      }

      if (!response.ok) {
        // Extrair mensagem de erro corretamente
        let errorMessage = 'Erro na requisição'
        
        if (data.detail) {
          // FastAPI geralmente usa 'detail'
          if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (Array.isArray(data.detail)) {
            // Erros de validação do Pydantic
            errorMessage = data.detail.map(err => 
              `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`
            ).join(', ')
          } else {
            errorMessage = JSON.stringify(data.detail)
          }
        } else if (data.message) {
          errorMessage = data.message
        } else if (typeof data === 'string') {
          errorMessage = data
        }
        
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      // Se é o último retry ou não é erro de rede, lançar erro
      if (i === retries || !error.message.includes('fetch')) {
        console.error('API Error:', error)
        throw error
      }
      
      // Esperar antes de tentar novamente (backoff exponencial)
      const delay = Math.min(1000 * Math.pow(2, i), 5000)
     
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// ========================================
// AUTENTICAÇÃO
// ========================================

export const authAPI = {
  // Login - formato correto descoberto: email + senha (português)
  login: async (email, password) => {
    return request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        senha: password  // Backend usa 'senha' (português) não 'password'
      }),
    })
  },

  // Registro
  register: async (userData) => {
    return request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        senha: userData.password,  // Backend usa 'senha' (português)
        user_type: userData.user_type
      }),
    })
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Verificar token / Obter dados do usuário
  me: async () => {
    return request('/api/v1/auth/me')
  },

  // Atualizar perfil
  updateMe: async (data) => {
    return request('/api/v1/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Alterar senha
  updatePassword: async (currentPassword, newPassword) => {
    return request('/api/v1/auth/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        senha_atual: currentPassword,  // Backend usa português
        nova_senha: newPassword         // Backend usa português
      }),
    })
  },
}

// ========================================
// USUÁRIOS (usando endpoints de auth/me)
// ========================================

export const userAPI = {
  // Obter perfil
  getProfile: async () => {
    return authAPI.me()
  },

  // Atualizar perfil
  updateProfile: async (data) => {
    return authAPI.updateMe(data)
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword) => {
    return authAPI.updatePassword(currentPassword, newPassword)
  },

  // Deletar conta (não há endpoint específico na imagem)
  deleteAccount: async () => {
    // TODO: Implementar quando houver endpoint no backend
    throw new Error('Endpoint de deletar conta não disponível')
  },
}

// ========================================
// PROJETOS
// ========================================

export const projectAPI = {
  // Listar todos os projetos
  getAll: async () => {
    return request('/api/v1/projects')
  },

  // Obter projeto por ID
  getById: async (id) => {
    return request(`/api/v1/projects/${id}`)
  },

  // Criar novo projeto
  create: async (projectData) => {
    // Backend espera campos em português!
    return request('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify({
        nome: projectData.name,                    // nome (português)
        descricao: projectData.description,        // descricao (português)
        nivel: projectData.level,                  // nivel (português)
        tecnologias: projectData.language ? 
          `${projectData.language}, ${projectData.framework || ''}, ${projectData.database || ''}`.trim() 
          : '',                                     // tecnologias (português) - concatena tudo
        prazo: projectData.deadline,               // prazo (português)
        tipo_cronograma: projectData.tipo_cronograma || 'semanal'
      }),
    })
  },

  // Atualizar projeto
  update: async (id, projectData) => {
    return request(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        backlog: projectData.backlog,
        checklist_tecnico: projectData.checklist_tecnico ?? null,
      }),
    })
  },

  regeneratePlan: async (projectId, { novo_titulo, novo_prazo } = {}) => {
    return request(`/api/v1/projects/${projectId}/regenerate-plan`, {
      method: 'POST',
      body: JSON.stringify({ novo_titulo: novo_titulo || null, novo_prazo: novo_prazo || null }),
    })
  },

  // Deletar projeto
  delete: async (id) => {
    return request(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    })
  },

  // Gerar planejamento com IA
  generatePlan: async (projectId) => {
    return request(`/api/v1/projects/${projectId}/generate-plan`, {
      method: 'POST',
    })
  },
}

// ========================================
// TAREFAS (não aparecem na imagem, mantendo estrutura genérica)
// ========================================

export const taskAPI = {
  // Listar tarefas de um projeto
  getByProject: async (projectId) => {
    return request(`/api/v1/projects/${projectId}/tasks`)
  },

  // Criar tarefa
  create: async (projectId, taskData) => {
    return request(`/api/v1/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  },

  // Atualizar tarefa
  update: async (projectId, taskId, taskData) => {
    return request(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
  },

  // Toggle completar tarefa
  toggleComplete: async (projectId, taskId) => {
    return request(`/api/v1/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
    })
  },

  // Deletar tarefa
  delete: async (projectId, taskId) => {
    return request(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },
}

// ========================================
// ASSINATURAS
// ========================================

export const planAPI = {
  // Criar assinatura PRO no Asaas
  // billing_type: "BOLETO" | "CREDIT_CARD" | "PIX" etc
  // cpf_cnpj: CPF ou CNPJ do cliente
  subscribe: async (billing_type, cpf_cnpj) => {
    return request('/api/v1/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ billing_type, cpf_cnpj }),
    })
  },

  // Cancelar assinatura PRO (downgrade para free)
  cancel: async () => {
    return request('/api/v1/subscriptions', {
      method: 'DELETE',
    })
  },

  // Obter status atual da assinatura
  getStatus: async () => {
    return request('/api/v1/subscriptions/status')
  },
}

// ========================================
// HEALTH CHECK
// ========================================

export const healthAPI = {
  check: async () => {
    return request('/health')
  }
}

export default {
  auth: authAPI,
  user: userAPI,
  project: projectAPI,
  task: taskAPI,
  plan: planAPI,
  health: healthAPI,
}
