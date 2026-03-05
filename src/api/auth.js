import { api } from './client'

export function register({ nome, email, senha }) {
  return api.post('/auth/register', { nome, email, senha })
}

export function login({ email, senha }) {
  return api.post('/auth/login', { email, senha })
}

export function getMe() {
  return api.get('/auth/me')
}

export function updateMe({ nome, email }) {
  return api.put('/auth/me', { nome, email })
}

export function updatePassword({ senha_atual, nova_senha }) {
  return api.put('/auth/me/password', { senha_atual, nova_senha })
}
