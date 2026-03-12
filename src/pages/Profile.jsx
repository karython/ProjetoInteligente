import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { userAPI, planAPI } from '../services/api'

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    userType: 'student'
  })
  const [saving, setSaving] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    loadProfile()
    loadSubscription()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile()
      setProfileData({
        name: data.nome || '',
        email: data.email || '',
        userType: data.user_type || 'student'
      })
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const loadSubscription = async () => {
    try {
      const data = await planAPI.getStatus()
      setSubscriptionStatus(data)
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const isPro = subscriptionStatus?.plano === 'pro' && subscriptionStatus?.subscription_status === 'active'
  const hasPendingSubscription = !isPro && subscriptionStatus?.subscription_status &&
    subscriptionStatus.subscription_status !== 'active'

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar o plano PRO? Você voltará para o plano gratuito.')) return
    setCanceling(true)
    try {
      await planAPI.cancel()
      await loadSubscription()
      alert('Assinatura cancelada.')
    } catch (error) {
      alert('Erro ao cancelar assinatura: ' + error.message)
    } finally {
      setCanceling(false)
    }
  }

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [activeSection, setActiveSection] = useState('profile')

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await userAPI.updateProfile({
        nome: profileData.name,
        email: profileData.email,
        user_type: profileData.userType
      })
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      alert('Erro ao atualizar perfil: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    try {
      await userAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      alert('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      alert('Erro ao alterar senha: ' + error.message)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
              activeSection === 'profile'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            👤 Informações Pessoais
          </button>
          <button
            onClick={() => setActiveSection('password')}
            className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
              activeSection === 'password'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🔒 Segurança
          </button>
          <button
            onClick={() => setActiveSection('subscription')}
            className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
              activeSection === 'subscription'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            💎 Assinatura
          </button>
        </div>

        {/* Informações Pessoais */}
        {activeSection === 'profile' && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações Pessoais</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input
                label="Nome Completo"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />

              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Usuário
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileData({...profileData, userType: 'student'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profileData.userType === 'student'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="font-semibold">Estudante</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileData({...profileData, userType: 'teacher'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profileData.userType === 'teacher'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">👨‍🏫</div>
                    <div className="font-semibold">Professor</div>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Segurança */}
        {activeSection === 'password' && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Alterar Senha</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <Input
                label="Senha Atual"
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />

              <Input
                label="Nova Senha"
                type="password"
                placeholder="Digite a nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />

              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Digite a nova senha novamente"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Dica:</strong> Use uma senha forte com pelo menos 8 caracteres, 
                  incluindo letras maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg">
                  Alterar Senha
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Assinatura */}
        {activeSection === 'subscription' && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Minha Assinatura</h2>

            {loadingSubscription ? (
              <p className="text-gray-500">Carregando...</p>
            ) : subscriptionStatus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Plano</p>
                    <p className="font-semibold text-gray-900 capitalize">{subscriptionStatus.plano || '—'}</p>
                  </div>
                  <div className={`rounded-xl p-4 ${hasPendingSubscription ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-1 ${hasPendingSubscription ? 'text-yellow-700' : 'text-gray-500'}`}>Status</p>
                    <p className={`font-semibold ${hasPendingSubscription ? 'text-yellow-800' : 'text-gray-900'}`}>
                      {isPro ? 'Ativo ✓' : hasPendingSubscription ? 'Aguardando pagamento' : (subscriptionStatus.subscription_status || '—')}
                    </p>
                  </div>
                  {subscriptionStatus.subscription_due_date && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Vencimento</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(subscriptionStatus.subscription_due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {subscriptionStatus.grace_period_end && (
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <p className="text-xs text-yellow-700 mb-1">Período de carência até</p>
                      <p className="font-semibold text-yellow-800">
                        {new Date(subscriptionStatus.grace_period_end).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {hasPendingSubscription && subscriptionStatus.payment_link && (
                    <a
                      href={subscriptionStatus.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-yellow-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      Pagar e ativar assinatura →
                    </a>
                  )}
                  {!isPro && !hasPendingSubscription && (
                    <a href="/plans" className="inline-block">
                      <Button variant="primary">Fazer Upgrade para PRO</Button>
                    </a>
                  )}
                  {(isPro || hasPendingSubscription) && (
                    <button
                      onClick={handleCancel}
                      disabled={canceling}
                      className="text-sm text-red-500 hover:text-red-700 px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      {canceling ? 'Cancelando...' : 'Cancelar assinatura'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Não foi possível carregar os dados da assinatura.</p>
            )}
          </Card>
        )}

        {/* Zona de Perigo */}
        <Card className="p-8 mt-6 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-3">Zona de Perigo</h2>
          <p className="text-gray-600 mb-4">
            Ações irreversíveis que afetam permanentemente sua conta.
          </p>
          <Button variant="secondary" className="border-red-300 text-red-600 hover:bg-red-50">
            Excluir Conta
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Profile
