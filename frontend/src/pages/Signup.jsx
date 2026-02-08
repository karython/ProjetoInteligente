import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulação de cadastro
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-primary/5 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Project Booster</h1>
        </Link>

        <Card className="p-8 animate-scale-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Criar sua conta</h2>
          <p className="text-gray-600 mb-8">Comece a organizar seus projetos</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome Completo"
              type="text"
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />

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
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Você é:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'student'})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.userType === 'student'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="font-semibold">Estudante</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'teacher'})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.userType === 'teacher'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👨‍🏫</div>
                  <div className="font-semibold">Professor</div>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Criar Conta
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Signup
