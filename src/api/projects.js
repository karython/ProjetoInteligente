import { api } from './client'

export function getProjects() {
  return api.get('/projects')
}

export function getProject(id) {
  return api.get(`/projects/${id}`)
}

export function createProject({ nome, descricao, nivel, tecnologias, prazo }) {
  return api.post('/projects', { nome, descricao, nivel, tecnologias, prazo })
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`)
}

export function generatePlan(id) {
  return api.post(`/projects/${id}/generate-plan`)
}
