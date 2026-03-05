import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { updateMe, updatePassword } from '../api/auth'

const Profile = () => {
  const { user, setUser } = useAuth()

  const [profileData, setProfileData] = useState({ nome: '', email: '' })
  const [passwordData, setPasswordData] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmPassword: ''
  })
  const [activeSection, setActiveSection] = useState('profile')
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({ nome: user.nome, email: user.email })
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg({ type: '', text: '' })
    try {
      const updated = await updateMe(profileData)
      setUser(updated)
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordMsg({ type: '', text: '' })
    if (passwordData.nova_senha !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem!' })
      return
    }
    setSavingPassword(true)
    try {
      await updatePassword({ senha_atual: passwordData.senha_atual, nova_senha: passwordData.nova_senha })
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' })
      setPasswordData({ senha_atual: '', nova_senha: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message })
    } finally {
      setSavingPassword(false)
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
        </div>

        {/* Informações Pessoais */}
        {activeSection === 'profile' && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações Pessoais</h2>

            {profileMsg.text && (
              <div className={`mb-4 p-4 rounded-xl text-sm ${
                profileMsg.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input
                label="Nome Completo"
                type="text"
                value={profileData.nome}
                onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />

              <div className="pt-4">
                <Button type="submit" size="lg" disabled={savingProfile}>
                  {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Segurança */}
        {activeSection === 'password' && (
          <Card className="p-8 animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Alterar Senha</h2>

            {passwordMsg.text && (
              <div className={`mb-4 p-4 rounded-xl text-sm ${
                passwordMsg.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <Input
                label="Senha Atual"
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.senha_atual}
                onChange={(e) => setPasswordData({ ...passwordData, senha_atual: e.target.value })}
                required
              />

              <Input
                label="Nova Senha"
                type="password"
                placeholder="Digite a nova senha"
                value={passwordData.nova_senha}
                onChange={(e) => setPasswordData({ ...passwordData, nova_senha: e.target.value })}
                required
              />

              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Digite a nova senha novamente"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Dica:</strong> Use uma senha forte com pelo menos 8 caracteres,
                  incluindo letras maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" disabled={savingPassword}>
                  {savingPassword ? 'Salvando...' : 'Alterar Senha'}
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
