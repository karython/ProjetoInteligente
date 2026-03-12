import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import { projectAPI, planAPI } from '../services/api'
import { mockProjects, folderStructure, technicalChecklist, timeline, schedule } from '../data/mockData'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('backlog')
  const [project, setProject] = useState(null)
  const [localPlan, setLocalPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [addTaskState, setAddTaskState] = useState(null) // { catIndex, value }
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [regenModal, setRegenModal] = useState(false)
  const [regenData, setRegenData] = useState({ novo_titulo: '', novo_prazo: '' })
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    loadProject()
    planAPI.getStatus().then(s => setIsPro(s?.plano === 'PRO' && s?.subscription_status === 'ACTIVE')).catch(() => {})
  }, [id])

  const loadProject = async () => {
    try {
      const data = await projectAPI.getById(id)
      setProject(data)
      setLocalPlan(data.plan || null)
    } catch (err) {
      console.error('Erro ao carregar projeto:', err)
      setError('Erro ao carregar projeto. Usando dados de exemplo.')
      const mock = mockProjects.find(p => p.id === parseInt(id)) || mockProjects[0]
      setProject(mock)
      setLocalPlan(mock.plan || null)
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async (updatedPlan, extraFields = {}) => {
    setSaving(true)
    try {
      await projectAPI.update(id, { ...updatedPlan, ...extraFields })
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStory = async (epicIndex, storyIndex) => {
    if (!localPlan?.backlog?.epicos) return
    const updated = JSON.parse(JSON.stringify(localPlan))
    const story = updated.backlog.epicos[epicIndex].user_stories[storyIndex]
    story.completed = !story.completed
    const allStories = updated.backlog.epicos.flatMap(e => e.user_stories || [])
    const progress = allStories.length > 0
      ? Math.round(allStories.filter(s => s.completed).length / allStories.length * 100)
      : 0
    setLocalPlan(updated)
    await savePlan(updated, { progresso: progress })
  }

  const handleToggleTask = async (catIndex, taskIndex) => {
    if (!localPlan?.checklist_tecnico?.itens) return
    const updated = JSON.parse(JSON.stringify(localPlan))
    const task = updated.checklist_tecnico.itens[catIndex].tarefas[taskIndex]
    task.completed = !task.completed
    setLocalPlan(updated)
    await savePlan(updated)
  }

  const handleAddTask = async (catIndex) => {
    if (!addTaskState?.value?.trim() || !localPlan?.checklist_tecnico?.itens) return
    const updated = JSON.parse(JSON.stringify(localPlan))
    updated.checklist_tecnico.itens[catIndex].tarefas.push({
      titulo: addTaskState.value.trim(),
      descricao: '',
      prioridade: 'Média',
      completed: false,
    })
    setLocalPlan(updated)
    setAddTaskState(null)
    await savePlan(updated)
  }

  const handleDeleteProject = async () => {
    setDeleting(true)
    try {
      await projectAPI.delete(id)
      navigate('/dashboard')
    } catch (err) {
      console.error('Erro ao excluir projeto:', err)
      setError('Erro ao excluir projeto: ' + err.message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const downloadMarkdown = () => {
    if (!project || !localPlan) return
    const lines = []
    lines.push(`# ${project.nome}\n`)
    lines.push(`> ${project.descricao}\n`)
    lines.push(`**Prazo:** ${project.prazo}  |  **Nível:** ${project.nivel}  |  **Tecnologias:** ${project.tecnologias}\n`)
    lines.push('---\n')
    lines.push('## Backlog\n')
    ;(localPlan.backlog?.epicos || []).forEach(ep => {
      lines.push(`### ${ep.titulo} [${ep.prioridade}]`)
      lines.push(ep.descricao || '')
      ;(ep.user_stories || []).forEach(s => {
        lines.push(`\n#### ${s.titulo}`)
        lines.push(s.descricao || '')
        if (s.criterios_aceite?.length) {
          lines.push('**Critérios de Aceite:**')
          s.criterios_aceite.forEach(c => lines.push(`- ${c}`))
        }
      })
      lines.push('')
    })
    lines.push('\n## Estrutura de Pastas\n')
    ;(localPlan.estrutura_pastas?.diretorios || []).forEach(d => {
      lines.push(`### \`${d.caminho}\``)
      lines.push(d.descricao || '')
      if (d.arquivos_principais?.length) lines.push(d.arquivos_principais.map(f => `- \`${f}\``).join('\n'))
      lines.push('')
    })
    lines.push('\n## Checklist Técnico\n')
    ;(localPlan.checklist_tecnico?.itens || []).forEach(cat => {
      lines.push(`### ${cat.categoria}`)
      ;(cat.tarefas || []).forEach(t => lines.push(`- [${t.completed ? 'x' : ' '}] **${t.titulo}** — ${t.descricao || ''}`))
      lines.push('')
    })
    lines.push('\n## Cronograma\n')
    const crono = localPlan.cronograma_sugerido
    if (crono?.semanas) {
      crono.semanas.forEach(s => {
        lines.push(`### Semana ${s.numero}`)
        ;(s.objetivos || []).forEach(o => lines.push(`- ${o}`))
        ;(s.entregas || []).forEach(e => lines.push(`- ✅ ${e}`))
        lines.push('')
      })
    } else if (crono?.dias) {
      crono.dias.forEach(d => {
        lines.push(`### ${d.data_referencia || 'Dia ' + d.numero}`)
        ;(d.objetivos || []).forEach(o => lines.push(`- ${o}`))
        ;(d.tarefas || []).forEach(t => lines.push(`  - ${t}`))
        lines.push('')
      })
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(project.nome || 'projeto').replace(/\s+/g, '-')}-planejamento.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    if (!project || !localPlan) return
    const epicos = (localPlan.backlog?.epicos || []).map(ep =>
      `<h3>${ep.titulo} <span style="font-size:12px;color:#666">[${ep.prioridade}]</span></h3>
       <p>${ep.descricao || ''}</p>
       ${(ep.user_stories || []).map(s =>
         `<div style="margin-left:16px;border-left:3px solid #8b5cf6;padding-left:12px;margin-bottom:8px">
           <b>${s.titulo}</b><p style="margin:4px 0">${s.descricao || ''}</p>
           ${s.criterios_aceite?.length ? '<ul>' + s.criterios_aceite.map(c => `<li>${c}</li>`).join('') + '</ul>' : ''}
         </div>`).join('')}`
    ).join('')
    const crono = localPlan.cronograma_sugerido
    const cronoHtml = (crono?.semanas || crono?.dias || []).map(item => {
      const label = crono?.semanas ? `Semana ${item.numero}` : (item.data_referencia || `Dia ${item.numero}`)
      const items = [...(item.objetivos || []).map(o => `<li>${o}</li>`), ...(item.entregas || item.tarefas || []).map(e => `<li>✅ ${e}</li>`)]
      return `<div style="margin-bottom:12px"><b>${label}</b><ul>${items.join('')}</ul></div>`
    }).join('')
    const checklist = (localPlan.checklist_tecnico?.itens || []).map(cat =>
      `<h4>${cat.categoria}</h4><ul>${(cat.tarefas || []).map(t =>
        `<li>[${t.completed ? '✓' : ' '}] <b>${t.titulo}</b> — ${t.descricao || ''}</li>`).join('')}</ul>`
    ).join('')
    const printWin = window.open('', '_blank')
    printWin.document.write(`<!DOCTYPE html><html><head><title>${project.nome} — Planejamento</title>
      <style>body{font-family:sans-serif;max-width:900px;margin:0 auto;padding:32px;color:#111}
      h1{color:#8b5cf6}h2{border-bottom:2px solid #8b5cf6;padding-bottom:4px;margin-top:32px}
      @media print{.no-print{display:none}}</style></head><body>
      <button class="no-print" onclick="window.print()" style="background:#8b5cf6;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;margin-bottom:24px">🖨️ Salvar como PDF</button>
      <h1>${project.nome}</h1><p>${project.descricao || ''}</p>
      <p><b>Prazo:</b> ${project.prazo} &nbsp; <b>Nível:</b> ${project.nivel} &nbsp; <b>Tecnologias:</b> ${project.tecnologias}</p>
      <h2>Backlog</h2>${epicos}
      <h2>Checklist Técnico</h2>${checklist}
      <h2>Cronograma</h2>${cronoHtml}
      </body></html>`)
    printWin.document.close()
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      await projectAPI.regeneratePlan(id, {
        novo_titulo: regenData.novo_titulo || undefined,
        novo_prazo: regenData.novo_prazo || undefined,
      })
      await loadProject()
      setRegenModal(false)
      setRegenData({ novo_titulo: '', novo_prazo: '' })
    } catch (err) {
      setError('Erro ao re-gerar: ' + err.message)
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando projeto...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Projeto não encontrado</h2>
          <Link to="/dashboard">
            <button className="text-primary hover:underline">Voltar ao Dashboard</button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  // Mapear campos da API (português) para exibição
  const allStories = localPlan?.backlog?.epicos?.flatMap(e => e.user_stories || []) || []
  const calculatedProgress = allStories.length > 0
    ? Math.round(allStories.filter(s => s.completed).length / allStories.length * 100)
    : (project.progresso || project.progress || 0)

  const displayProject = {
    id: project.id,
    name: project.nome || project.name,
    description: project.descricao || project.description,
    level: project.nivel || project.level,
    tecnologias: project.tecnologias || '',
    deadline: project.prazo || project.deadline,
    status: project.status || 'ativo',
    progress: calculatedProgress,
    plan: localPlan,
    framework: project.tecnologias ? project.tecnologias.split(',')[1]?.trim() : 'N/A',
    database: project.tecnologias ? project.tecnologias.split(',')[2]?.trim() : 'N/A',
    language: project.tecnologias ? project.tecnologias.split(',')[0]?.trim() : 'N/A',
  }

  // Usar dados do plano gerado pela IA ou fallback para mock
  // A API retorna estruturas aninhadas: backlog.epicos, checklist_tecnico.itens, etc.
  const backlog = localPlan?.backlog?.epicos ||
                  (Array.isArray(localPlan?.backlog) ? localPlan.backlog : null) ||
                  mockProjects[0].tasks
  const estruturaPastas = localPlan?.estrutura_pastas?.diretorios ||
                          localPlan?.estrutura_pastas || folderStructure
  const checklistTecnico = localPlan?.checklist_tecnico?.itens ||
                            (Array.isArray(localPlan?.checklist_tecnico) ? localPlan.checklist_tecnico : null) ||
                            technicalChecklist
  const sequencia = localPlan?.sequencia_desenvolvimento?.fases ||
                    (Array.isArray(localPlan?.sequencia_desenvolvimento) ? localPlan.sequencia_desenvolvimento : null) ||
                    timeline
  const cronograma = localPlan?.cronograma_sugerido || schedule

  const tabs = [
    { id: 'backlog', label: 'Backlog', icon: '📋' },
    { id: 'structure', label: 'Estrutura de Pastas', icon: '📁' },
    { id: 'checklist', label: 'Checklist Técnico', icon: '✅' },
    { id: 'timeline', label: 'Sequência Ideal', icon: '⏱️' },
    { id: 'schedule', label: 'Cronograma', icon: '📅' },  // semanal ou diário
  ]

  const renderFolderTree = (node, level = 0) => {
    // Suporte ao formato da API (nome, arquivos, subdiretorios) e mock (name, type, children)
    const displayName = node.nome || node.name || ''
    const isFolder = node.type === 'folder' || node.subdiretorios !== undefined || node.arquivos !== undefined
    const children = node.children || node.subdiretorios || []
    const arquivos = node.arquivos || []
    return (
      <div key={displayName + level} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center gap-2 py-1">
          <span className="text-lg">
            {isFolder ? '📁' : '📄'}
          </span>
          <span className={`${isFolder ? 'font-semibold' : 'text-gray-600'}`}>
            {displayName}
          </span>
        </div>
        {children && children.map(child => renderFolderTree(child, level + 1))}
        {arquivos && arquivos.map((arq, i) => (
          <div key={i} className={`ml-6`}>
            <div className="flex items-center gap-2 py-1">
              <span className="text-lg">📄</span>
              <span className="text-gray-600">{typeof arq === 'string' ? arq : arq.nome || arq.name}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard" className="text-primary hover:underline">
              ← Voltar ao Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {saving && <span className="text-sm text-gray-500">Salvando...</span>}
              {isPro && localPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadMarkdown}
                    title="Baixar como Markdown (README)"
                    className="px-3 py-1.5 text-xs font-semibold text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    ⬇ Markdown
                  </button>
                  <button
                    onClick={downloadPDF}
                    title="Visualizar e salvar como PDF"
                    className="px-3 py-1.5 text-xs font-semibold text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    ⬇ PDF
                  </button>
                  <button
                    onClick={() => setRegenModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    ♻ Re-gerar Plano
                  </button>
                </div>
              )}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Excluir Projeto
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Tem certeza?</span>
                  <button
                    onClick={handleDeleteProject}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Excluindo...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
              {error}
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayProject.name}</h1>
              <p className="text-gray-600">{displayProject.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progresso</div>
              <div className="text-3xl font-bold text-primary">{displayProject.progress}%</div>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tecnologia Principal</div>
              <div className="font-semibold text-gray-900">💻 {displayProject.language}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Framework</div>
              <div className="font-semibold text-gray-900">🚀 {displayProject.framework}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Prazo</div>
              <div className="font-semibold text-gray-900">📅 {displayProject.deadline ? new Date(displayProject.deadline).toLocaleDateString('pt-BR') : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Nível</div>
              <div className="font-semibold text-gray-900">⭐ {displayProject.level}</div>
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
                  {Array.isArray(backlog) ? (
                    <>
                      {backlog.filter(t => t.completed).length} de {backlog.length} concluídas
                    </>
                  ) : (
                    'Sem tarefas'
                  )}
                </div>
              </div>

              {!Array.isArray(backlog) || backlog.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">Nenhuma tarefa gerada ainda.</p>
                  <p className="text-sm text-gray-500">O planejamento está sendo processado ou não foi gerado.</p>
                </Card>
              ) : backlog[0]?.user_stories ? (
                // Formato da API: epicos com user_stories
                <div className="space-y-6">
                  {backlog.map((epic, epicIndex) => (
                    <Card key={epicIndex} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{epic.titulo}</h3>
                        {epic.prioridade && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            epic.prioridade === 'Alta' ? 'bg-red-100 text-red-700' :
                            epic.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{epic.prioridade}</span>
                        )}
                      </div>
                      {epic.descricao && <p className="text-gray-600 text-sm mb-4">{epic.descricao}</p>}
                      {epic.user_stories && epic.user_stories.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">User Stories:</h4>
                          {epic.user_stories.map((story, storyIndex) => (
                            <div
                              key={storyIndex}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleToggleStory(epicIndex, storyIndex)}
                            >
                              <input
                                type="checkbox"
                                checked={story.completed || false}
                                onChange={() => handleToggleStory(epicIndex, storyIndex)}
                                className="mt-1 w-4 h-4 rounded cursor-pointer"
                                onClick={e => e.stopPropagation()}
                              />
                              <div>
                                <div className={`font-medium text-sm ${story.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{story.titulo}</div>
                                {story.descricao && <div className="text-gray-500 text-xs mt-0.5">{story.descricao}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                // Formato mock: lista plana de tarefas
                <Card className="divide-y divide-gray-100">
                  {backlog.map((task, index) => (
                    <div key={task.id || index} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.titulo || task.title || task.nome || task.description}
                          </div>
                        </div>
                        {(task.priority || task.prioridade) && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.priority === 'high' || task.priority === 'alta' || task.prioridade === 'Alta' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' || task.priority === 'média' || task.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.prioridade || (task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : task.priority)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              {Array.isArray(backlog) && backlog.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Progresso Geral</span>
                    <span className="text-sm font-bold text-primary">{displayProject.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${displayProject.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estrutura de Pastas */}
          {activeTab === 'structure' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Estrutura de Pastas Recomendada</h2>
              {Array.isArray(estruturaPastas) && estruturaPastas.length > 0 && estruturaPastas[0]?.caminho ? (
                // Formato da API: lista de diretórios com caminho, descricao, arquivos_principais
                <div className="space-y-4">
                  {estruturaPastas.map((dir, i) => (
                    <Card key={i} className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-xl">📁</span>
                        <div>
                          <div className="font-mono font-bold text-gray-900">{dir.caminho}</div>
                          {dir.descricao && <div className="text-gray-500 text-sm mt-0.5">{dir.descricao}</div>}
                        </div>
                      </div>
                      {dir.arquivos_principais && dir.arquivos_principais.length > 0 && (
                        <div className="ml-8 space-y-1">
                          {dir.arquivos_principais.map((arq, j) => (
                            <div key={j} className="flex items-center gap-2 font-mono text-sm text-gray-600">
                              <span>📄</span>
                              <span>{arq}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : Array.isArray(estruturaPastas) && estruturaPastas.length > 0 ? (
                <Card className="p-6">
                  <div className="font-mono text-sm">
                    {estruturaPastas.map((dir, i) => (
                      <div key={i}>{renderFolderTree(dir)}</div>
                    ))}
                  </div>
                </Card>
              ) : estruturaPastas && typeof estruturaPastas === 'object' && !Array.isArray(estruturaPastas) ? (
                <Card className="p-6">
                  <div className="font-mono text-sm">{renderFolderTree(estruturaPastas)}</div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">Estrutura de pastas ainda não gerada.</p>
                </Card>
              )}
            </div>
          )}

          {/* Checklist Técnico */}
          {activeTab === 'checklist' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Checklist Técnico</h2>
              {!Array.isArray(checklistTecnico) || checklistTecnico.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">Checklist técnico ainda não gerado.</p>
                </Card>
              ) : checklistTecnico[0]?.categoria ? (
                // Formato da API: categorias com tarefas
                <div className="space-y-6">
                  {checklistTecnico.map((categoria, catIndex) => (
                    <Card key={catIndex} className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{categoria.categoria}</h3>
                      <div className="space-y-2">
                        {(categoria.tarefas || []).map((tarefa, tarefaIndex) => (
                          <div
                            key={tarefaIndex}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleToggleTask(catIndex, tarefaIndex)}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                              tarefa.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`}>
                              {tarefa.completed && <span className="text-white text-xs">✓</span>}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${tarefa.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{tarefa.titulo || tarefa.title}</div>
                              {tarefa.descricao && <div className="text-gray-500 text-xs mt-0.5">{tarefa.descricao}</div>}
                            </div>
                            {tarefa.prioridade && (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                tarefa.prioridade === 'Alta' ? 'bg-red-100 text-red-700' :
                                tarefa.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>{tarefa.prioridade}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Adicionar nova tarefa */}
                      {addTaskState?.catIndex === catIndex ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={addTaskState.value}
                            onChange={e => setAddTaskState({ catIndex, value: e.target.value })}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddTask(catIndex); if (e.key === 'Escape') setAddTaskState(null) }}
                            placeholder="Nome da tarefa..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddTask(catIndex)}
                            className="px-3 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={() => setAddTaskState(null)}
                            className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddTaskState({ catIndex, value: '' })}
                          className="mt-3 text-sm text-primary hover:underline font-medium"
                        >
                          + Adicionar tarefa
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                // Formato mock: lista plana
                <>
                  <Card className="divide-y divide-gray-100">
                    {checklistTecnico.map((item, index) => (
                      <div key={item.id || index} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            item.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {item.completed && <span className="text-white text-sm">✓</span>}
                          </div>
                          <span className={`flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'}`}>
                            {item.titulo || item.title || item.nome || item.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Card>
                  <div className="mt-6">
                    <div className="text-sm text-gray-600">
                      {checklistTecnico.filter(i => i.completed).length} de {checklistTecnico.length} itens concluídos
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sequência Ideal */}
          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sequência Ideal de Desenvolvimento</h2>
              {!Array.isArray(sequencia) || sequencia.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">Sequência de desenvolvimento ainda não gerada.</p>
                </Card>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {sequencia.map((phase, index) => (
                      <div key={index} className="relative flex gap-6">
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          phase.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {phase.completed ? '✓' : index + 1}
                        </div>
                        <Card className={`flex-1 p-6 ${phase.completed ? 'bg-green-50 border-green-200' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{phase.titulo || phase.phase || phase.nome || phase.title}</h3>
                              <p className="text-sm text-gray-600">{phase.descricao || phase.week || phase.prazo || phase.duration}</p>
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
              )}
            </div>
          )}

          {/* Cronograma */}
          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronograma Semanal</h2>
              {!cronograma || (!Array.isArray(cronograma) && !cronograma.weeks && !cronograma.semanas) ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">Cronograma ainda não gerado.</p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {(cronograma.semanas || cronograma.weeks || cronograma).map((week, index) => {
                    const weekNum = week.numero || week.semana || week.number || index + 1
                    const items = week.objetivos || week.atividades || week.tasks || []
                    const deliverables = week.entregas || []
                    return (
                      <Card key={weekNum} className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="text-primary font-bold">{weekNum}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{week.titulo || week.title || week.nome || `Semana ${weekNum}`}</h3>
                            <p className="text-sm text-gray-600">Semana {weekNum}</p>
                          </div>
                        </div>
                        {Array.isArray(items) && items.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Objetivos:</h4>
                            <ul className="space-y-1">
                              {items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700">
                                  <span className="text-primary mt-1">•</span>
                                  <span className="text-sm">{typeof item === 'string' ? item : item.titulo || item.title || item.nome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(deliverables) && deliverables.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Entregas:</h4>
                            <ul className="space-y-1">
                              {deliverables.map((entrega, i) => (
                                <li key={i} className="flex items-start gap-2 text-green-700">
                                  <span className="mt-1">✓</span>
                                  <span className="text-sm">{typeof entrega === 'string' ? entrega : entrega.titulo || entrega.nome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(!items.length && !deliverables.length) && (
                          <p className="text-gray-500 text-sm">Sem tarefas definidas</p>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>

      {regenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRegenModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Re-gerar Planejamento</h2>
            <p className="text-sm text-gray-500 mb-6">
              O plano atual será substituído. Os campos abaixo são opcionais — deixe em branco para manter os valores atuais.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Novo título (opcional)</label>
                <input
                  type="text"
                  value={regenData.novo_titulo}
                  onChange={e => setRegenData(p => ({ ...p, novo_titulo: e.target.value }))}
                  placeholder={project?.nome}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nova data de entrega (opcional)</label>
                <input
                  type="date"
                  value={regenData.novo_prazo}
                  onChange={e => setRegenData(p => ({ ...p, novo_prazo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {regenerating ? '⏳ Gerando...' : '✨ Re-gerar'}
              </button>
              <button
                onClick={() => { setRegenModal(false); setRegenData({ novo_titulo: '', novo_prazo: '' }) }}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
  )
}

export default ProjectDetail
