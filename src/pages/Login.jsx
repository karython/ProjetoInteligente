import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulação de login
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-primary/5 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Project Booster</h1>
        </Link>

        <Card className="p-8 animate-scale-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
          <p className="text-gray-600 mb-8">Entre com suas credenciais</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="rounded" />
                Lembrar-me
              </label>
              <a href="#" className="text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Não tem uma conta?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Login
