import { Link } from 'react-router-dom'
import Button from '../components/Button'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Project Booster</h1>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold animate-in">
            ✨ Planejamento Inteligente com IA
          </div>
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight animate-in-delay-1">
            Transforme suas ideias em
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              projetos estruturados
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-in-delay-2">
            Organize seus projetos acadêmicos e técnicos com planejamento automático, 
            cronogramas inteligentes e checklists personalizados.
          </p>
          <Link to="/signup">
            <Button size="lg" className="animate-in-delay-3">
              Criar Meu Projeto Grátis →
            </Button>
          </Link>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Como Funciona
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📝',
                title: 'Descreva seu Projeto',
                description: 'Responda perguntas simples sobre tecnologias, prazo e objetivos'
              },
              {
                icon: '🤖',
                title: 'IA Gera o Planejamento',
                description: 'Receba backlog, cronograma, estrutura de pastas e checklist técnico'
              },
              {
                icon: '🚀',
                title: 'Execute com Confiança',
                description: 'Siga o passo a passo organizado e acompanhe seu progresso'
              }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Por Que Usar o Project Booster?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '⏱️', title: 'Economize Tempo', text: 'Pare de perder horas planejando. Nossa IA faz isso em segundos.' },
              { icon: '✅', title: 'Nada Esquecido', text: 'Checklist completo de tudo que você precisa implementar.' },
              { icon: '📊', title: 'Visão Clara', text: 'Acompanhe o progresso e saiba exatamente o que fazer.' },
              { icon: '🎯', title: 'Foco no Código', text: 'Menos planejamento manual, mais tempo programando.' },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-4xl">{benefit.icon}</div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Quem é */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-8">
            Ideal Para
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {['Estudantes de TI', 'Projetos de TCC', 'Desenvolvedores Iniciantes'].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="font-semibold text-gray-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Escolha Seu Plano
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Free</h4>
              <p className="text-4xl font-bold text-gray-900 mb-6">R$ 0<span className="text-lg text-gray-500">/mês</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">✓ 2 projetos ativos</li>
                <li className="flex items-center gap-2 text-gray-700">✓ 1 geração por projeto</li>
                <li className="flex items-center gap-2 text-gray-700">✓ Backlog básico</li>
              </ul>
              <Link to="/signup">
                <Button variant="secondary" className="w-full">Começar Grátis</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-8 text-white relative overflow-hidden border-2 border-primary">
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <h4 className="text-2xl font-bold mb-2">Pro</h4>
              <p className="text-4xl font-bold mb-6">R$ 19<span className="text-lg opacity-80">/mês</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">✓ Projetos ilimitados</li>
                <li className="flex items-center gap-2">✓ Replanejamento inteligente</li>
                <li className="flex items-center gap-2">✓ Exportação em PDF</li>
                <li className="flex items-center gap-2">✓ Ajuste automático de prazos</li>
              </ul>
              <Link to="/signup">
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                  Assinar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Project Booster</h2>
          <p className="text-gray-400 mb-6">Planejamento inteligente para seus projetos acadêmicos</p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
          <p className="mt-8 text-gray-500 text-sm">© 2026 Project Booster. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
