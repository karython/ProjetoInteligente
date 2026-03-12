import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Stepper from '../components/Stepper'
import { projectAPI } from '../services/api'

const NewProject = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
    level: 'intermediate',
    language: '',
    framework: '',
    database: '',
    hosting: '',
    deadline: '',
    tipo_cronograma: 'semanal',
    goal: ''
  })

  const steps = ['Informações Básicas', 'Tecnologias', 'Prazo', 'Objetivo']

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Gerar planejamento via API
      setLoading(true)
      try {
        const projectData = {
          name: formData.name,
          description: formData.description,
          area: formData.area,
          level: formData.level,
          language: formData.language,
          framework: formData.framework,
          database: formData.database,
          hosting: formData.hosting,
          deadline: formData.deadline,
          tipo_cronograma: formData.tipo_cronograma,
          goal: formData.goal
        }

        // Criar projeto
        const newProject = await projectAPI.create(projectData)
        
        // Gerar planejamento automático com IA
        try {
          await projectAPI.generatePlan(newProject.id)
        } catch (planError) {
          console.warn('Erro ao gerar planejamento:', planError)
          // Continua mesmo se falhar, o usuário pode gerar depois
        }
        
        navigate(`/project/${newProject.id}`)
      } catch (error) {
        alert('Erro ao criar projeto: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Projeto</h1>
          <p className="text-gray-600">Preencha as informações para gerar o planejamento inteligente</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <Card className="p-8">
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações Básicas</h2>
              
              <Input
                label="Nome do Projeto"
                placeholder="Ex: Sistema de Gerenciamento Escolar"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  rows="4"
                  placeholder="Descreva brevemente seu projeto..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <Input
                label="Área do Projeto"
                placeholder="Ex: Educação, E-commerce, Saúde..."
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nível de Complexidade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'beginner', label: 'Iniciante', icon: '🌱' },
                    { value: 'intermediate', label: 'Intermediário', icon: '🚀' },
                    { value: 'advanced', label: 'Avançado', icon: '⭐' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateField('level', level.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.level === level.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{level.icon}</div>
                      <div className="text-sm font-semibold">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tecnologias */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tecnologias</h2>

              <Input
                label="Linguagem Principal"
                placeholder="Ex: JavaScript, Python, Java..."
                value={formData.language}
                onChange={(e) => updateField('language', e.target.value)}
              />

              <Input
                label="Framework"
                placeholder="Ex: React, Django, Spring..."
                value={formData.framework}
                onChange={(e) => updateField('framework', e.target.value)}
              />

              <Input
                label="Banco de Dados"
                placeholder="Ex: MongoDB, PostgreSQL, MySQL..."
                value={formData.database}
                onChange={(e) => updateField('database', e.target.value)}
              />

              <Input
                label="Hospedagem"
                placeholder="Ex: Vercel, AWS, Heroku..."
                value={formData.hosting}
                onChange={(e) => updateField('hosting', e.target.value)}
              />
            </div>
          )}

          {/* Step 3: Prazo */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prazo e Organização</h2>

              <Input
                label="Data de Entrega"
                type="date"
                value={formData.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Cronograma
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'semanal', label: 'Por Semana', icon: '📅', desc: 'Planejamento dividido em semanas' },
                    { value: 'diario', label: 'Por Dia', icon: '📆', desc: 'Planejamento detalhado dia a dia' },
                  ].map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => updateField('tipo_cronograma', tipo.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.tipo_cronograma === tipo.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{tipo.icon}</div>
                      <div className="text-sm font-semibold">{tipo.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{tipo.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Dica:</strong> O cronograma será gerado do início até a data de entrega,
                  {formData.tipo_cronograma === 'diario'
                    ? ' com tarefas específicas para cada dia útil.'
                    : ' agrupando as atividades por semana.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Objetivo */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Objetivo do Projeto</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qual é o objetivo deste projeto?
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  rows="6"
                  placeholder="Ex: Projeto final da disciplina de Desenvolvimento Web, portfólio profissional, aprender novas tecnologias..."
                  value={formData.goal}
                  onChange={(e) => updateField('goal', e.target.value)}
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-900">
                  ✨ <strong>Tudo pronto!</strong> Vamos gerar um planejamento completo com backlog, 
                  estrutura de pastas, checklist técnico e cronograma personalizado.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="disabled:opacity-50"
            >
              ← Voltar
            </Button>

            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Gerando planejamento...
                </>
              ) : (
                currentStep === 4 ? '✨ Gerar Planejamento Inteligente' : 'Próximo →'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default NewProject
