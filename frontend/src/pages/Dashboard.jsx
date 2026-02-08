import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import { mockProjects } from '../data/mockData'

const Dashboard = () => {
  const activeProjects = mockProjects.filter(p => p.status === 'active')
  const completedProjects = mockProjects.filter(p => p.status === 'completed')
  const avgProgress = Math.round(
    mockProjects.reduce((acc, p) => acc + p.progress, 0) / mockProjects.length
  )

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
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📁
              </div>
              <span className="text-3xl font-bold text-primary">{activeProjects.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Projetos Ativos</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
              <span className="text-3xl font-bold text-green-600">{completedProjects.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Projetos Concluídos</h3>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
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

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Meus Projetos</h2>
            <Link to="/new-project">
              <Button variant="outline" size="sm">+ Novo Projeto</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {mockProjects.map((project) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <Card hover className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'active' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {project.status === 'active' ? 'Em andamento' : 'Concluído'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          💻 {project.framework}
                        </span>
                        <span className="flex items-center gap-1">
                          🗄️ {project.database}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {new Date(project.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-semibold text-gray-700">Progresso</span>
                      <span className="font-bold text-primary">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
