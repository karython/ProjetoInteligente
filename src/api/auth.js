import { api } from './client'

export function register({ nome, email, senha }) {
  return api.post('/auth/register', { nome, email, senha })
}

export function login({ email, senha }) {
  return api.post('/auth/login', { email, senha })
}
