import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'

const Plans = () => {
  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Ideal para começar',
      features: [
        { text: '2 projetos ativos', included: true },
        { text: '1 geração por projeto', included: true },
        { text: 'Backlog básico', included: true },
        { text: 'Estrutura de pastas', included: true },
        { text: 'Replanejamento', included: false },
        { text: 'Exportação PDF', included: false },
        { text: 'Ajuste automático de prazos', included: false },
      ],
      buttonText: 'Plano Atual',
      buttonVariant: 'secondary',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 'R$ 19',
      period: '/mês',
      description: 'Para profissionais e estudantes dedicados',
      features: [
        { text: 'Projetos ilimitados', included: true },
        { text: 'Gerações ilimitadas', included: true },
        { text: 'Backlog completo', included: true },
        { text: 'Estrutura de pastas', included: true },
        { text: 'Replanejamento inteligente', included: true },
        { text: 'Exportação em PDF', included: true },
        { text: 'Ajuste automático de prazos', included: true },
        { text: 'Suporte prioritário', included: true },
      ],
      buttonText: 'Fazer Upgrade',
      buttonVariant: 'primary',
      highlighted: true,
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal Para Você
          </h1>
          <p className="text-xl text-gray-600">
            Desbloqueie todo o potencial do planejamento inteligente
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                plan.highlighted
                  ? 'border-2 border-primary shadow-xl scale-105'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-primary-light text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ RECOMENDADO
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 mb-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.included
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {feature.included ? '✓' : '−'}
                    </div>
                    <span
                      className={
                        feature.included
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                className="w-full"
                size="lg"
              >
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem custos adicionais.',
              },
              {
                q: 'O que acontece com meus projetos se eu cancelar o Pro?',
                a: 'Seus projetos continuarão acessíveis, mas você ficará limitado às funcionalidades do plano Free.',
              },
              {
                q: 'Como funciona o replanejamento inteligente?',
                a: 'No plano Pro, você pode solicitar que a IA regenere o planejamento com base em mudanças de escopo, tecnologias ou prazos.',
              },
              {
                q: 'Posso fazer upgrade ou downgrade depois?',
                a: 'Sim! Você pode alterar seu plano a qualquer momento.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-gradient-to-br from-primary to-primary-light rounded-2xl text-white">
          <h3 className="text-3xl font-bold mb-3">
            Pronto para turbinar seus projetos?
          </h3>
          <p className="text-lg opacity-90 mb-6">
            Junte-se a centenas de estudantes que já estão organizando seus projetos com IA
          </p>
          <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
            Começar Agora
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Plans
