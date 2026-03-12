import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authAPI, planAPI } from '../services/api'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)

  useEffect(() => {
    planAPI.getStatus()
      .then(setSubscriptionStatus)
      .catch(() => {})
  }, [])

  const menuItems = [
    { name: 'Meus Projetos', path: '/dashboard', icon: '📁' },
    { name: 'Novo Projeto', path: '/new-project', icon: '✨' },
    { name: 'Planos', path: '/plans', icon: '💎' },
    { name: 'Meu Perfil', path: '/profile', icon: '👤' },
  ]

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      authAPI.logout()
      navigate('/')
    }
  }

  const isPro = subscriptionStatus?.plano === 'pro' && subscriptionStatus?.subscription_status === 'active'
  const planLabel = isPro ? 'Plano PRO' : 'Plano Free'

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <Link to="/" className="block mb-8">
        <img src="/logoPlanejador.png" alt="Planejador de ideias" className="h-18 w-auto" />
      </Link>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 mt-4"
        >
          <span className="text-xl"></span>
          <span className="font-medium">Sair</span>
        </button>
      </nav>

      <div className="mt-auto">
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-4 text-white">
          <p className="text-sm font-semibold mb-1">{planLabel}</p>
          {isPro ? (
            <p className="text-xs opacity-90 mb-3">Acesso completo ativo</p>
          ) : (
            <p className="text-xs opacity-90 mb-3">2 projetos restantes</p>
          )}
          {!isPro && (
            <Link to="/plans">
              <button className="w-full bg-white text-primary py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Fazer Upgrade
              </button>
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
