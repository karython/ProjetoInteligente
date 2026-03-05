import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import { getProject, generatePlan, deleteProject } from '../api/projects'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('backlog')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProject(id)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true)
    setError('')
    try {
      await generatePlan(id)
      const updated = await getProject(id)
      setProject(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setGeneratingPlan(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    try {
      await deleteProject(id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  const tabs = [
    { id: 'backlog', label: 'Backlog', icon: '📋' },
    { id: 'structure', label: 'Estrutura de Pastas', icon: '📁' },
    { id: 'checklist', label: 'Checklist Técnico', icon: '✅' },
    { id: 'timeline', label: 'Sequência Ideal', icon: '⏱️' },
    { id: 'schedule', label: 'Cronograma', icon: '📅' },
  ]

  const renderList = (items) => {
    if (!items) return <p className="text-gray-500">Nenhum item disponível.</p>
    if (Array.isArray(items)) {
      return (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-primary mt-1">•</span>
              <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
            </li>
          ))}
        </ul>
      )
    }
    return <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(items, null, 2)}</pre>
  }

  const renderPlanSection = (data) => {
    if (!data) return <p className="text-gray-500">Dados não disponíveis.</p>

    if (Array.isArray(data)) {
      return (
        <Card className="divide-y divide-gray-100">
          {data.map((item, i) => (
            <div key={i} className="p-5">
              {typeof item === 'string' ? (
                <p className="text-gray-700">{item}</p>
              ) : (
                <div>
                  {item.titulo && <p className="font-semibold text-gray-900">{item.titulo}</p>}
                  {item.descricao && <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>}
                  {item.tarefas && renderList(item.tarefas)}
                  {!item.titulo && !item.descricao && !item.tarefas && (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </Card>
      )
    }

    if (typeof data === 'object') {
      const entries = Object.entries(data)
      return (
        <div className="space-y-4">
          {entries.map(([key, value]) => (
            <Card key={key} className="p-5">
              <h3 className="font-semibold text-gray-900 mb-2 capitalize">{key.replace(/_/g, ' ')}</h3>
              {renderList(value)}
            </Card>
          ))}
        </div>
      )
    }

    return <p className="text-gray-700">{String(data)}</p>
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-gray-500 text-center py-16">Carregando projeto...</p>
      </DashboardLayout>
    )
  }

  if (error && !project) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
      </DashboardLayout>
    )
  }

  const plan = project?.plan

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard" className="text-primary hover:underline mb-4 inline-block">
            ← Voltar ao Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.nome}</h1>
              <p className="text-gray-600">{project.descricao}</p>
            </div>
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Excluir projeto
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Project Info */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tecnologias</div>
              <div className="font-semibold text-gray-900">💻 {project.tecnologias}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Prazo</div>
              <div className="font-semibold text-gray-900">📅 {new Date(project.prazo).toLocaleDateString('pt-BR')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Nível</div>
              <div className="font-semibold text-gray-900">⭐ {project.nivel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="font-semibold text-gray-900">{project.status === 'active' ? '🔵 Ativo' : '✅ Concluído'}</div>
            </div>
          </div>
        </Card>

        {/* No plan yet */}
        {!plan && (
          <Card className="p-8 text-center mb-6">
            <p className="text-gray-600 mb-4">Este projeto ainda não possui um planejamento gerado pela IA.</p>
            <Button onClick={handleGeneratePlan} disabled={generatingPlan}>
              {generatingPlan ? 'Gerando planejamento...' : '✨ Gerar Planejamento Inteligente'}
            </Button>
          </Card>
        )}

        {/* Tabs - only shown when plan exists */}
        {plan && (
          <>
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-semibold transition-all rounded-t-xl whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-in">
              {activeTab === 'backlog' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Backlog do Projeto</h2>
                  {renderPlanSection(plan.backlog)}
                </div>
              )}

              {activeTab === 'structure' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Estrutura de Pastas Recomendada</h2>
                  <Card className="p-6 font-mono text-sm">
                    {renderPlanSection(plan.estrutura_pastas)}
                  </Card>
                </div>
              )}

              {activeTab === 'checklist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Checklist Técnico</h2>
                  {renderPlanSection(plan.checklist_tecnico)}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Sequência Ideal de Desenvolvimento</h2>
                  {renderPlanSection(plan.sequencia_desenvolvimento)}
                </div>
              )}

              {activeTab === 'schedule' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronograma Semanal</h2>
                  {renderPlanSection(plan.cronograma_sugerido)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProjectDetail
