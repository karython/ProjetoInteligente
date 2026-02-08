import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    userType: 'student'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [activeSection, setActiveSection] = useState('profile')

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    alert('Perfil atualizado com sucesso!')
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }
    alert('Senha alterada com sucesso!')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
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
