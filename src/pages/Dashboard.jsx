import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import { projectAPI } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectAPI.getAll()

      const mappedProjects = data.map(project => {
        const allStories = project.plan?.backlog?.epicos?.flatMap(e => e.user_stories || []) || []
        const progress = allStories.length > 0
          ? Math.round(allStories.filter(s => s.completed).length / allStories.length * 100)
          : (project.progresso || 0)

        const isConcluido = project.status === 'concluido' || project.status === 'concluído'
        const status = (isConcluido || progress === 100) ? 'completed' : 'active'

        return {
          id: project.id,
          name: project.nome || 'Projeto sem nome',
          description: project.descricao || 'Sem descrição',
          area: project.area || 'N/A',
          level: project.nivel || 'N/A',
          language: project.tecnologias ? project.tecnologias.split(',')[0]?.trim() : 'N/A',
          framework: project.tecnologias ? project.tecnologias.split(',')[1]?.trim() : 'N/A',
          database: project.tecnologias ? project.tecnologias.split(',')[2]?.trim() : 'N/A',
          hosting: 'N/A',
          deadline: project.prazo || new Date().toISOString().split('T')[0],
          goal: project.objetivo || 'N/A',
          progress,
          status,
          createdAt: project.data_criacao || new Date().toISOString(),
          tasks: project.plan?.backlog || [],
        }
      })

      setProjects(mappedProjects)
      setError('')
    } catch (err) {
      console.error('Erro completo:', err)
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        setError('A API está demorando para responder. Aguarde alguns segundos e recarregue a página.')
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Sessão expirada. Faça login novamente.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError('Erro ao carregar projetos: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const activeProjects    = projects.filter(p => p.status === 'active' && p.progress < 100)
  const completedProjects = projects.filter(p => p.status === 'completed' || p.progress === 100)
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando projetos...</p>
            <p className="text-sm text-gray-500 mt-2">A API pode demorar alguns segundos se estava hibernando</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="p-8 text-center border-red-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar Projetos</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
              <Button variant="outline" onClick={() => navigate('/new-project')}>Criar Novo Projeto</Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo de volta! Veja o status dos seus projetos.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📁</div>
              <span className="text-3xl font-bold text-primary">{activeProjects.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Projetos Ativos</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">✅</div>
              <span className="text-3xl font-bold text-green-600">{completedProjects.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Projetos Concluídos</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">📊</div>
              <span className="text-3xl font-bold text-purple-600">{avgProgress}%</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Progresso Médio</h3>
          </Card>
        </div>

        {/* Welcome Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary to-primary-light text-white">
          <h2 className="text-2xl font-bold mb-3">🚀 Pronto para criar algo incrível?</h2>
          <p className="mb-6 opacity-90">
            Comece um novo projeto e deixe nossa IA criar todo o planejamento para você.
          </p>
          <Link to="/new-project">
            <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Criar Novo Projeto
            </Button>
          </Link>
        </Card>

        {/* Projects list */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Meus Projetos</h2>
            <Link to="/new-project">
              <Button variant="outline" size="sm">+ Novo Projeto</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 mb-4">Você ainda não tem projetos.</p>
                <Link to="/new-project"><Button>Criar Primeiro Projeto</Button></Link>
              </Card>
            ) : (
              projects.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <Card hover className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            project.status === 'completed' || project.progress === 100
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {project.status === 'completed' || project.progress === 100 ? 'Concluído' : 'Em andamento'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">💻 {project.framework}</span>
                          <span className="flex items-center gap-1">🗄️ {project.database}</span>
                          <span className="flex items-center gap-1">
                            📅 {new Date(project.deadline).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="font-semibold text-gray-700">Progresso</span>
                        <span className="font-bold text-primary">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.progress === 100 ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard