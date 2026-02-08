import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import { mockProjects, folderStructure, technicalChecklist, timeline, schedule } from '../data/mockData'

const ProjectDetail = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('backlog')
  const project = mockProjects.find(p => p.id === parseInt(id)) || mockProjects[0]

  const tabs = [
    { id: 'backlog', label: 'Backlog', icon: '📋' },
    { id: 'structure', label: 'Estrutura de Pastas', icon: '📁' },
    { id: 'checklist', label: 'Checklist Técnico', icon: '✅' },
    { id: 'timeline', label: 'Sequência Ideal', icon: '⏱️' },
    { id: 'schedule', label: 'Cronograma', icon: '📅' },
  ]

  const renderFolderTree = (node, level = 0) => {
    return (
      <div key={node.name} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center gap-2 py-1">
          <span className="text-lg">
            {node.type === 'folder' ? '📁' : '📄'}
          </span>
          <span className={`${node.type === 'folder' ? 'font-semibold' : 'text-gray-600'}`}>
            {node.name}
          </span>
        </div>
        {node.children && node.children.map(child => renderFolderTree(child, level + 1))}
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progresso</div>
              <div className="text-3xl font-bold text-primary">{project.progress}%</div>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Framework</div>
              <div className="font-semibold text-gray-900">💻 {project.framework}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Banco de Dados</div>
              <div className="font-semibold text-gray-900">🗄️ {project.database}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Prazo</div>
              <div className="font-semibold text-gray-900">📅 {new Date(project.deadline).toLocaleDateString('pt-BR')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Nível</div>
              <div className="font-semibold text-gray-900">⭐ {project.level}</div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
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

        {/* Tab Content */}
        <div className="animate-in">
          {/* Backlog */}
          {activeTab === 'backlog' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tarefas do Projeto</h2>
                <div className="text-sm text-gray-600">
                  {project.tasks.filter(t => t.completed).length} de {project.tasks.length} concluídas
                </div>
              </div>

              <Card className="divide-y divide-gray-100">
                {project.tasks.map((task) => (
                  <div key={task.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        readOnly
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Progresso Geral</span>
                  <span className="text-sm font-bold text-primary">{project.progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Estrutura de Pastas */}
          {activeTab === 'structure' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Estrutura de Pastas Recomendada</h2>
              <Card className="p-6">
                <div className="font-mono text-sm">
                  {renderFolderTree(folderStructure)}
                </div>
              </Card>
            </div>
          )}

          {/* Checklist Técnico */}
          {activeTab === 'checklist' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Checklist Técnico</h2>
              <Card className="divide-y divide-gray-100">
                {technicalChecklist.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        item.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        {item.completed && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className={`flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
              <div className="mt-6">
                <div className="text-sm text-gray-600">
                  {technicalChecklist.filter(i => i.completed).length} de {technicalChecklist.length} itens concluídos
                </div>
              </div>
            </div>
          )}

          {/* Sequência Ideal */}
          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sequência Ideal de Desenvolvimento</h2>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {timeline.map((phase, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        phase.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {phase.completed ? '✓' : index + 1}
                      </div>
                      <Card className={`flex-1 p-6 ${phase.completed ? 'bg-green-50 border-green-200' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{phase.phase}</h3>
                            <p className="text-sm text-gray-600">{phase.week}</p>
                          </div>
                          {phase.completed && (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                              Concluído
                            </span>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cronograma */}
          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronograma Semanal</h2>
              <div className="grid gap-6">
                {schedule.weeks.map((week) => (
                  <Card key={week.number} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-primary font-bold">{week.number}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{week.title}</h3>
                        <p className="text-sm text-gray-600">Semana {week.number}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {week.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="text-primary mt-1">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProjectDetail
