import { Link } from 'react-router-dom'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <Link to="/" className="text-primary hover:underline mb-6 inline-block">
          ← Voltar para Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Política de Privacidade
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Última atualização: 14 de março de 2026
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Seção 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. INTRODUÇÃO</h2>
            <p className="text-gray-700 mb-4">
              A sua privacidade é importante para nós. Esta Política de Privacidade explica como o{' '}
              <strong>Project Booster</strong> coleta, usa, compartilha e protege suas informações pessoais.
            </p>
            <p className="text-gray-700 mb-4">
              Esta política está em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>{' '}
              e outras legislações aplicáveis.
            </p>
            <p className="text-gray-700">
              Ao usar nossa plataforma, você concorda com as práticas descritas nesta política.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. DEFINIÇÕES</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Dados Pessoais:</strong> informação relacionada a pessoa natural identificada ou identificável</li>
              <li><strong>Titular:</strong> pessoa natural a quem se referem os dados pessoais</li>
              <li><strong>Controlador:</strong> Project Booster, quem decide sobre o tratamento de dados pessoais</li>
              <li><strong>Tratamento:</strong> qualquer operação com dados pessoais (coleta, armazenamento, uso, etc.)</li>
              <li><strong>Consentimento:</strong> autorização livre, informada e inequívoca do titular</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. RESPONSÁVEL PELO TRATAMENTO DE DADOS</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold mb-2">Controlador de Dados:</p>
              <ul className="space-y-1 text-gray-700">
                <li><strong>Nome:</strong> Project Booster</li>
                <li><strong>Email:</strong> privacidade@projectbooster.com.br</li>
                <li><strong>Encarregado (DPO):</strong> dpo@projectbooster.com.br</li>
              </ul>
            </div>
          </section>

          {/* Seção 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. DADOS QUE COLETAMOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Dados Fornecidos por Você</h3>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Ao criar uma conta:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>Senha (armazenada criptografada)</li>
                <li>Tipo de usuário (Estudante ou Professor)</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Ao usar o serviço:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Informações de projetos (nome, descrição, tecnologias, prazos)</li>
                <li>Objetivos e metas de projetos</li>
                <li>Preferências de uso</li>
                <li>Feedback e comunicações</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Ao assinar plano Pro:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Informações de pagamento (processadas por terceiros seguros)</li>
                <li>Histórico de transações</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Dados Coletados Automaticamente</h3>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Dados Técnicos:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Endereço IP</li>
                <li>Tipo e versão do navegador</li>
                <li>Sistema operacional</li>
                <li>Identificadores de dispositivo</li>
                <li>Dados de cookies</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Dados de Uso:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Páginas visitadas</li>
                <li>Tempo de uso</li>
                <li>Recursos utilizados</li>
                <li>Interações com a plataforma</li>
                <li>Logs de acesso e atividades</li>
              </ul>
            </div>
          </section>

          {/* Seção 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. COMO USAMOS SEUS DADOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Finalidades do Tratamento</h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Prestação do Serviço:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>✓ Criar e gerenciar sua conta</li>
                  <li>✓ Autenticar e autorizar acesso</li>
                  <li>✓ Gerar planejamentos de projetos com IA</li>
                  <li>✓ Armazenar e organizar seus projetos</li>
                  <li>✓ Processar pagamentos (plano Pro)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">Comunicação:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>✓ Enviar emails transacionais (confirmações, redefinição de senha)</li>
                  <li>✓ Notificações sobre o serviço</li>
                  <li>✓ Responder solicitações de suporte</li>
                  <li>✓ Enviar atualizações importantes</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">Melhoria do Serviço:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>✓ Analisar uso e comportamento (dados agregados)</li>
                  <li>✓ Identificar e corrigir problemas técnicos</li>
                  <li>✓ Desenvolver novos recursos</li>
                  <li>✓ Treinar e melhorar algoritmos de IA</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Base Legal</h3>
            <p className="text-gray-700 mb-4">Tratamos seus dados com base em:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Execução de contrato:</strong> prestação do serviço contratado</li>
              <li><strong>Consentimento:</strong> quando você autoriza expressamente</li>
              <li><strong>Obrigação legal:</strong> cumprimento de leis</li>
              <li><strong>Legítimo interesse:</strong> melhoria do serviço e segurança</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. COMPARTILHAMENTO DE DADOS</h2>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1 Não Vendemos Seus Dados</h3>
              <p className="text-gray-700">
                Nós <strong>NUNCA</strong> vendemos, alugamos ou comercializamos seus dados pessoais.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Com Quem Compartilhamos</h3>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Prestadores de Serviços:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Provedores de hospedagem e infraestrutura</li>
                <li>Processadores de pagamento</li>
                <li>Serviços de email transacional</li>
                <li>Ferramentas de análise e monitoramento</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Requisitos Legais:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Autoridades governamentais (quando legalmente obrigados)</li>
                <li>Processos judiciais</li>
                <li>Proteção de direitos e segurança</li>
              </ul>
            </div>
          </section>

          {/* Seção 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. INTELIGÊNCIA ARTIFICIAL E DADOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Uso de IA</h3>
            <p className="text-gray-700 mb-4">Nossa IA utiliza suas informações de projeto para:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Gerar planejamentos personalizados</li>
              <li>Sugerir estruturas e cronogramas</li>
              <li>Criar checklists técnicos</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Aprendizado de Máquina</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>A IA pode aprender com padrões agregados e anônimos</li>
              <li>Seus dados específicos de projeto <strong>NÃO</strong> são usados para treinar a IA de forma identificável</li>
              <li>Não compartilhamos seus projetos com outros usuários</li>
            </ul>
          </section>

          {/* Seção 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. SEGURANÇA DOS DADOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Medidas de Segurança</h3>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Técnicas:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Criptografia de dados em trânsito (SSL/TLS)</li>
                <li>Criptografia de senhas (hash bcrypt)</li>
                <li>Firewalls e proteção DDoS</li>
                <li>Backups regulares</li>
                <li>Monitoramento de segurança</li>
                <li>Controle de acesso</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">Organizacionais:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Acesso restrito a dados pessoais</li>
                <li>Treinamento de equipe</li>
                <li>Políticas de segurança internas</li>
                <li>Análise de riscos periódicas</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Limitações</h3>
            <p className="text-gray-700">
              Nenhum sistema é 100% seguro. Você reconhece os riscos inerentes à internet e se compromete a 
              manter sua senha confidencial, não compartilhar sua conta, e notificar-nos sobre atividades suspeitas.
            </p>
          </section>

          {/* Seção 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. RETENÇÃO DE DADOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Período de Retenção</h3>
            <p className="text-gray-700 mb-4">Mantemos seus dados enquanto:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Sua conta estiver ativa</li>
              <li>Necessário para prestar o serviço</li>
              <li>Exigido por lei</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Após Exclusão da Conta</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Dados pessoais são removidos em até <strong>30 dias</strong></li>
              <li>Alguns dados podem ser mantidos por obrigações legais (ex: registros fiscais)</li>
              <li>Dados agregados e anônimos podem ser mantidos indefinidamente</li>
            </ul>
          </section>

          {/* Seção 10 - SEUS DIREITOS (LGPD) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. SEUS DIREITOS (LGPD)</h2>
            
            <div className="bg-primary/10 p-6 rounded-lg mb-4">
              <p className="text-gray-900 font-semibold mb-4">Como titular de dados, você tem direito a:</p>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">✓ Confirmação e Acesso</p>
                  <p className="text-gray-700 text-sm">Confirmar se tratamos seus dados e acessá-los</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900">✓ Correção</p>
                  <p className="text-gray-700 text-sm">Corrigir dados incompletos, inexatos ou desatualizados</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900">✓ Anonimização ou Exclusão</p>
                  <p className="text-gray-700 text-sm">Solicitar anonimização ou exclusão de dados desnecessários</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900">✓ Portabilidade</p>
                  <p className="text-gray-700 text-sm">Solicitar dados em formato estruturado e interoperável</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900">✓ Revogação do Consentimento</p>
                  <p className="text-gray-700 text-sm">Revogar consentimento a qualquer momento</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900">✓ Revisão de Decisões Automatizadas</p>
                  <p className="text-gray-700 text-sm">Solicitar revisão de decisões baseadas unicamente em IA</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.9 Como Exercer Seus Direitos</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Por Email:</strong> privacidade@projectbooster.com.br</li>
              <li><strong>Pela Plataforma:</strong> Configurações → Privacidade e Dados</li>
              <li><strong>Prazo de Resposta:</strong> Até 15 dias</li>
            </ul>
          </section>

          {/* Seção 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. COOKIES E TECNOLOGIAS SIMILARES</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 O Que São Cookies</h3>
            <p className="text-gray-700 mb-4">
              Cookies são pequenos arquivos de texto armazenados em seu dispositivo.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Cookies Que Usamos</h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <p className="font-semibold text-gray-900">Essenciais:</p>
                <p className="text-gray-700 text-sm">Autenticação de sessão, segurança, funcionalidades básicas</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900">Funcionais:</p>
                <p className="text-gray-700 text-sm">Preferências de usuário, configurações salvas</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900">Analíticos:</p>
                <p className="text-gray-700 text-sm">Estatísticas de uso, comportamento agregado</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.3 Gerenciamento de Cookies</h3>
            <p className="text-gray-700 mb-4">Você pode:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Aceitar ou recusar cookies via banner</li>
              <li>Configurar seu navegador para bloquear cookies</li>
              <li>Excluir cookies existentes</li>
            </ul>
            <p className="text-gray-700 text-sm italic mt-2">
              Nota: Bloquear cookies essenciais pode afetar funcionalidades.
            </p>
          </section>

          {/* Seção 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. TRANSFERÊNCIA INTERNACIONAL DE DADOS</h2>
            <p className="text-gray-700 mb-4">
              Seus dados são armazenados primariamente em servidores localizados no <strong>Brasil</strong> ou 
              em países com nível adequado de proteção reconhecido pela ANPD.
            </p>
            <p className="text-gray-700">
              Quando necessário transferir dados internacionalmente, utilizamos cláusulas contratuais padrão e 
              garantimos níveis adequados de proteção.
            </p>
          </section>

          {/* Seção 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. MENORES DE IDADE</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">13.1 Idade Mínima</h3>
            <p className="text-gray-700 mb-4">
              Nosso serviço é destinado a pessoas com <strong>13 anos ou mais</strong>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">13.2 Dados de Menores</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Menores entre 13-18 anos devem ter consentimento dos pais/responsáveis</li>
              <li>Não coletamos intencionalmente dados de menores de 13 anos</li>
              <li>Se identificarmos dados de menores de 13 anos, os excluiremos imediatamente</li>
            </ul>
          </section>

          {/* Seção 14 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. ALTERAÇÕES NA POLÍTICA</h2>
            <p className="text-gray-700 mb-4">
              Podemos atualizar esta Política periodicamente. Mudanças significativas serão notificadas por 
              email, notificação na plataforma ou aviso destacado no site.
            </p>
            <p className="text-gray-700">
              O uso continuado após mudanças constitui aceitação da nova política.
            </p>
          </section>

          {/* Seção 15 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. LEGISLAÇÃO E FORO</h2>
            <p className="text-gray-700 mb-4">Esta Política é regida pela:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong></li>
              <li><strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong></li>
              <li><strong>Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong></li>
              <li>Demais legislações brasileiras aplicáveis</li>
            </ul>
          </section>

          {/* Seção 16 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. CONTATO E DPO</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Encarregado de Dados (DPO)</h3>
            <p className="text-gray-700 mb-4">Para questões sobre privacidade e proteção de dados:</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li><strong>Email:</strong> dpo@projectbooster.com.br</li>
              <li><strong>Email Alternativo:</strong> privacidade@projectbooster.com.br</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Suporte Geral</h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li><strong>Email:</strong> contato@projectbooster.com.br</li>
              <li><strong>Website:</strong> https://projectbooster.com.br</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Autoridade Nacional</h3>
            <p className="text-gray-700">
              Você também pode contatar a <strong>ANPD (Autoridade Nacional de Proteção de Dados)</strong>:<br/>
              <a href="https://www.gov.br/anpd/" target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline">
                https://www.gov.br/anpd/
              </a>
            </p>
          </section>

          {/* Seção 17 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. CONSENTIMENTO</h2>
            <div className="bg-primary/10 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold mb-4">Ao usar o Project Booster, você:</p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Confirma ter lido esta Política de Privacidade</li>
                <li>✓ Compreende como tratamos seus dados</li>
                <li>✓ Consente com o tratamento conforme descrito</li>
                <li>✓ Está ciente de seus direitos como titular</li>
              </ul>
            </div>
          </section>

          {/* Seção 18 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. TRANSPARÊNCIA</h2>
            <p className="text-gray-700">
              Estamos comprometidos com a transparência. Se tiver dúvidas sobre como tratamos seus dados, 
              compartilhamento com terceiros, medidas de segurança, ou seus direitos, entre em contato conosco. 
              Responderemos de forma clara e completa.
            </p>
          </section>

          <div className="border-t pt-6 mt-8 text-center text-gray-600">
            <p className="mb-2"><strong>Data de Vigência:</strong> 14 de março de 2026</p>
            <p className="mb-4"><strong>Versão:</strong> 1.0</p>
            <p className="text-sm mb-2">
              <strong>Project Booster</strong><br/>
              Comprometidos com sua privacidade e conformidade com a LGPD 🇧🇷
            </p>
            <p className="text-sm">© 2026 Project Booster. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Privacy