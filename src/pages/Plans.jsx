import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { planAPI } from '../services/api'

const Plans = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [showSubscribeForm, setShowSubscribeForm] = useState(false)
  const [subscribeData, setSubscribeData] = useState({ billing_type: 'PIX', cpf_cnpj: '' })
  const [subscribing, setSubscribing] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [paymentLink, setPaymentLink] = useState(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const data = await planAPI.getStatus()
      setSubscriptionStatus(data)
    } catch (error) {
      console.error('Erro ao carregar status da assinatura:', error)
    } finally {
      setLoadingStatus(false)
    }
  }

  const isPro = subscriptionStatus?.plano === 'pro' && subscriptionStatus?.subscription_status === 'active'
  const hasPendingSubscription = !isPro && subscriptionStatus?.subscription_status &&
    subscriptionStatus.subscription_status !== 'active'
  const paymentLinkToUse = paymentLink || subscriptionStatus?.payment_link

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!subscribeData.cpf_cnpj.trim()) {
      alert('Informe seu CPF ou CNPJ.')
      return
    }
    setSubscribing(true)
    try {
      const result = await planAPI.subscribe(subscribeData.billing_type, subscribeData.cpf_cnpj)
      setPaymentLink(result.payment_link)
      setShowSubscribeForm(false)
      await loadStatus()
    } catch (error) {
      alert('Erro ao criar assinatura: ' + error.message)
    } finally {
      setSubscribing(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar o plano PRO? Você voltará para o plano gratuito.')) return
    setCanceling(true)
    try {
      await planAPI.cancel()
      await loadStatus()
      alert('Assinatura cancelada. Você voltou para o plano gratuito.')
    } catch (error) {
      alert('Erro ao cancelar assinatura: ' + error.message)
    } finally {
      setCanceling(false)
    }
  }

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
      highlighted: true,
    },
  ]

  const billingTypes = [
    { value: 'PIX', label: 'PIX' },
    { value: 'BOLETO', label: 'Boleto Bancário' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
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

        {/* Status atual */}
        {!loadingStatus && subscriptionStatus && (
          <div className={`mb-8 p-4 rounded-xl border ${
            isPro ? 'bg-green-50 border-green-200' :
            hasPendingSubscription ? 'bg-yellow-50 border-yellow-300' :
            'bg-gray-50 border-gray-200'
          }`}>
            <p className="font-semibold text-gray-800">
              Plano atual:{' '}
              <span className={isPro ? 'text-green-700' : hasPendingSubscription ? 'text-yellow-700' : 'text-gray-600'}>
                {isPro ? 'PRO ✓' : hasPendingSubscription ? 'PRO (aguardando pagamento)' : 'Free'}
              </span>
            </p>
            {subscriptionStatus.subscription_due_date && (
              <p className="text-sm text-gray-600 mt-1">
                Vencimento: {new Date(subscriptionStatus.subscription_due_date).toLocaleDateString('pt-BR')}
              </p>
            )}
            {subscriptionStatus.grace_period_end && !isPro && (
              <p className="text-sm text-yellow-700 mt-1">
                Acesso PRO até: {new Date(subscriptionStatus.grace_period_end).toLocaleDateString('pt-BR')}
              </p>
            )}
            {hasPendingSubscription && paymentLinkToUse && (
              <a
                href={paymentLinkToUse}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm"
              >
                Pagar e ativar assinatura →
              </a>
            )}
          </div>
        )}

        {/* Link de pagamento gerado */}
        {paymentLink && (
          <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="font-semibold text-blue-900 mb-2">Assinatura criada! Finalize o pagamento:</p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Pagar agora →
            </a>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrent = plan.name === 'Free' ? !isPro && !hasPendingSubscription : isPro

            return (
              <Card
                key={plan.name}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
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
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-500'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {loadingStatus ? (
                  <Button variant="secondary" className="w-full" size="lg" disabled>
                    Carregando...
                  </Button>
                ) : plan.name === 'Pro' ? (
                  isPro ? (
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full" size="lg" disabled>
                        Plano Atual ✓
                      </Button>
                      <button
                        onClick={handleCancel}
                        disabled={canceling}
                        className="w-full text-sm text-red-500 hover:text-red-700 py-2 transition-colors"
                      >
                        {canceling ? 'Cancelando...' : 'Cancelar assinatura'}
                      </button>
                    </div>
                  ) : hasPendingSubscription ? (
                    <div className="space-y-2">
                      <div className="w-full text-center bg-yellow-100 text-yellow-800 font-semibold py-3 rounded-xl text-sm">
                        ⏳ Aguardando pagamento
                      </div>
                      {paymentLinkToUse && (
                        <a
                          href={paymentLinkToUse}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-yellow-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                        >
                          Pagar e ativar →
                        </a>
                      )}
                      <button
                        onClick={handleCancel}
                        disabled={canceling}
                        className="w-full text-sm text-red-500 hover:text-red-700 py-2 transition-colors"
                      >
                        {canceling ? 'Cancelando...' : 'Cancelar assinatura'}
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      size="lg"
                      onClick={() => setShowSubscribeForm(true)}
                    >
                      Fazer Upgrade
                    </Button>
                  )
                ) : isCurrent ? (
                  <Button variant="secondary" className="w-full" size="lg" disabled>
                    Plano Atual
                  </Button>
                ) : null}
              </Card>
            )
          })}
        </div>

        {/* Modal de Assinatura */}
        {showSubscribeForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Assinar Plano PRO</h2>
              <p className="text-gray-600 mb-6">Preencha os dados para criar sua assinatura.</p>

              <form onSubmit={handleSubscribe} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Forma de pagamento
                  </label>
                  <select
                    value={subscribeData.billing_type}
                    onChange={(e) => setSubscribeData({ ...subscribeData, billing_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {billingTypes.map((bt) => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="CPF ou CNPJ"
                  type="text"
                  placeholder="000.000.000-00"
                  value={subscribeData.cpf_cnpj}
                  onChange={(e) => setSubscribeData({ ...subscribeData, cpf_cnpj: e.target.value })}
                  required
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowSubscribeForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={subscribing}>
                    {subscribing ? 'Processando...' : 'Confirmar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
        {!isPro && !loadingStatus && (
          <div className="text-center mt-12 p-8 bg-gradient-to-br from-primary to-primary-light rounded-2xl text-white">
            <h3 className="text-3xl font-bold mb-3">
              Pronto para turbinar seus projetos?
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Junte-se a centenas de estudantes que já estão organizando seus projetos com IA
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => setShowSubscribeForm(true)}
            >
              Começar Agora
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Plans
