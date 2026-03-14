import { Link } from 'react-router-dom'

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <Link to="/" className="text-primary hover:underline mb-6 inline-block">
          ← Voltar para Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Termos de Uso
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Última atualização: 14 de março de 2026
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Seção 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ACEITAÇÃO DOS TERMOS</h2>
            <p className="text-gray-700 mb-4">
              Bem-vindo ao <strong>Project Booster</strong>!
            </p>
            <p className="text-gray-700 mb-4">
              Estes Termos de Uso ("Termos") regem o acesso e uso da plataforma Project Booster, 
              um serviço online de planejamento inteligente de projetos acadêmicos e técnicos.
            </p>
            <p className="text-gray-700">
              Ao acessar ou usar o Project Booster, você concorda em estar vinculado a estes Termos. 
              Se você não concorda com qualquer parte destes Termos, não use nossa plataforma.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. DEFINIÇÕES</h2>
            <p className="text-gray-700 mb-4">Para fins destes Termos:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>"Plataforma"</strong> ou <strong>"Serviço"</strong>: refere-se ao Project Booster, incluindo website, aplicações móveis e APIs.</li>
              <li><strong>"Usuário"</strong>, <strong>"você"</strong> ou <strong>"seu"</strong>: refere-se à pessoa física ou jurídica que acessa ou usa a Plataforma.</li>
              <li><strong>"Nós"</strong>, <strong>"nosso"</strong> ou <strong>"Project Booster"</strong>: refere-se aos operadores da Plataforma.</li>
              <li><strong>"Conteúdo do Usuário"</strong>: informações, dados, textos ou outros materiais enviados por você à Plataforma.</li>
              <li><strong>"Planejamento"</strong>: resultado gerado pela inteligência artificial com base nas informações fornecidas pelo Usuário.</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. DESCRIÇÃO DO SERVIÇO</h2>
            <p className="text-gray-700 mb-4">
              O Project Booster é uma plataforma SaaS (Software as a Service) que oferece:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Geração automática de planejamentos de projetos usando inteligência artificial</li>
              <li>Criação de backlogs, cronogramas e estruturas de pastas</li>
              <li>Ferramentas de organização e acompanhamento de projetos</li>
              <li>Checklists técnicos personalizados</li>
              <li>Sugestões de sequência de desenvolvimento</li>
            </ul>
            <p className="text-gray-700 mt-4">
              O serviço é destinado a estudantes, professores e desenvolvedores que desejam organizar projetos acadêmicos e técnicos.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. CADASTRO E CONTA</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Elegibilidade</h3>
            <p className="text-gray-700 mb-4">Para usar o Project Booster, você deve:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Ter pelo menos 13 anos de idade</li>
              <li>Fornecer informações verdadeiras, precisas e completas durante o cadastro</li>
              <li>Manter suas informações de conta atualizadas</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Responsabilidade pela Conta</h3>
            <p className="text-gray-700 mb-4">Você é responsável por:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Todas as atividades que ocorrem em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Conta de Menores</h3>
            <p className="text-gray-700">
              Se você tem entre 13 e 18 anos, deve ter a permissão de seus pais ou responsáveis para usar o serviço.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. PLANOS E PAGAMENTOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Planos Disponíveis</h3>
            <p className="text-gray-700 mb-4">O Project Booster oferece:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Plano Free:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>2 projetos ativos</li>
                <li>1 geração de planejamento por projeto</li>
                <li>Funcionalidades básicas</li>
              </ul>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Plano Pro:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Projetos ilimitados</li>
                <li>Gerações ilimitadas de planejamento</li>
                <li>Replanejamento inteligente</li>
                <li>Exportação em PDF</li>
                <li>Ajuste automático de prazos</li>
                <li>Suporte prioritário</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Pagamentos</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Os valores dos planos são cobrados mensalmente</li>
              <li>O pagamento é processado no momento da assinatura e renovado automaticamente</li>
              <li>Você pode cancelar sua assinatura a qualquer momento</li>
              <li>Não oferecemos reembolsos por períodos parciais</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Alterações de Preços</h3>
            <p className="text-gray-700 mb-4">
              Reservamo-nos o direito de modificar os preços dos planos. Mudanças serão comunicadas com 30 dias de antecedência.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.4 Cancelamento</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Você pode cancelar sua assinatura Pro a qualquer momento através das configurações da conta</li>
              <li>Após o cancelamento, você manterá acesso aos recursos Pro até o final do período pago</li>
              <li>Projetos criados no plano Pro permanecem acessíveis, mas ficam sujeitos às limitações do plano Free</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. USO ACEITÁVEL</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Permissões</h3>
            <p className="text-gray-700 mb-4">Você pode usar o Project Booster para:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Criar e gerenciar projetos pessoais ou acadêmicos</li>
              <li>Gerar planejamentos para seus projetos</li>
              <li>Exportar e utilizar os planejamentos gerados</li>
              <li>Compartilhar projetos com colaboradores (quando disponível)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Proibições</h3>
            <p className="text-gray-700 mb-4">Você NÃO pode:</p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li>❌ Usar o serviço para finalidades ilegais ou não autorizadas</li>
              <li>❌ Tentar acessar áreas restritas do sistema</li>
              <li>❌ Fazer engenharia reversa, descompilar ou desmontar o software</li>
              <li>❌ Usar robôs, scrapers ou ferramentas automatizadas sem autorização</li>
              <li>❌ Sobrecarregar ou interferir com o funcionamento da Plataforma</li>
              <li>❌ Revender, redistribuir ou sublicenciar o acesso ao serviço</li>
              <li>❌ Usar o serviço para criar conteúdo ilegal, difamatório ou prejudicial</li>
              <li>❌ Tentar burlar as limitações do plano Free</li>
              <li>❌ Compartilhar sua conta com terceiros</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Consequências</h3>
            <p className="text-gray-700 mb-4">Violações destes termos podem resultar em:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Suspensão temporária ou permanente da conta</li>
              <li>Exclusão de conteúdo</li>
              <li>Ações legais, quando aplicável</li>
            </ul>
          </section>

          {/* Seção 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. PROPRIEDADE INTELECTUAL</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Propriedade da Plataforma</h3>
            <p className="text-gray-700 mb-4">
              O Project Booster, incluindo seu design, código, logotipos, marcas e todo o conteúdo original, 
              são de propriedade exclusiva nossa e estão protegidos por leis de propriedade intelectual.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Seu Conteúdo</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Você mantém todos os direitos sobre o conteúdo que envia à Plataforma</li>
              <li>Ao usar o serviço, você nos concede uma licença limitada para processar seu conteúdo e gerar planejamentos</li>
              <li>Nós não reivindicamos propriedade sobre suas informações de projeto</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Planejamentos Gerados</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Os planejamentos gerados pela IA são fornecidos a você para seu uso</li>
              <li>Você pode usar, modificar e distribuir os planejamentos gerados como desejar</li>
              <li>Não reivindicamos direitos autorais sobre os planejamentos específicos gerados para você</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.4 Feedback</h3>
            <p className="text-gray-700">
              Se você nos fornecer sugestões ou feedback, podemos usá-los livremente sem qualquer obrigação com você.
            </p>
          </section>

          {/* Seção 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. INTELIGÊNCIA ARTIFICIAL</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Natureza do Serviço de IA</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Os planejamentos são gerados por inteligência artificial com base nas informações fornecidas</li>
              <li>A IA faz sugestões baseadas em padrões e melhores práticas conhecidas</li>
              <li>Os resultados podem variar e não são garantias de sucesso do projeto</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Responsabilidade do Usuário</h3>
            <p className="text-gray-700 mb-4">Você é responsável por:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Revisar e validar os planejamentos gerados</li>
              <li>Adaptar as sugestões à sua realidade específica</li>
              <li>Tomar decisões finais sobre como implementar seu projeto</li>
              <li>Verificar a viabilidade técnica das sugestões</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Limitações</h3>
            <p className="text-gray-700 mb-4">A IA não substitui:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Análise técnica especializada</li>
              <li>Consultoria profissional</li>
              <li>Planejamento humano detalhado</li>
              <li>Expertise em áreas específicas</li>
            </ul>
          </section>

          {/* Seção 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. PRIVACIDADE E DADOS</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Coleta de Dados</h3>
            <p className="text-gray-700 mb-4">
              Coletamos e processamos dados conforme descrito em nossa{' '}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Uso de Dados</h3>
            <p className="text-gray-700 mb-4">Seus dados são usados para:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Fornecer e melhorar o serviço</li>
              <li>Gerar planejamentos personalizados</li>
              <li>Comunicações relacionadas ao serviço</li>
              <li>Análises agregadas e anônimas</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Segurança</h3>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de segurança para proteger seus dados, mas nenhum sistema é 100% seguro. 
              Você reconhece e aceita os riscos inerentes ao uso de serviços online.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.4 Seus Direitos</h3>
            <p className="text-gray-700 mb-4">Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir informações incorretas</li>
              <li>Solicitar exclusão de sua conta e dados</li>
              <li>Exportar seus dados</li>
            </ul>
          </section>

          {/* Seção 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. LIMITAÇÃO DE RESPONSABILIDADE</h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Garantias</h3>
              <p className="text-gray-700 mb-4">
                O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER TIPO, 
                EXPRESSAS OU IMPLÍCITAS.
              </p>
            </div>

            <p className="text-gray-700 mb-4">Não garantimos que:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>O serviço será ininterrupto ou livre de erros</li>
              <li>Os resultados serão precisos ou confiáveis</li>
              <li>Defeitos serão corrigidos</li>
              <li>O serviço atenderá suas expectativas específicas</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Limitação de Responsabilidade</h3>
            <p className="text-gray-700 mb-4">NA MÁXIMA EXTENSÃO PERMITIDA POR LEI:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Não seremos responsáveis por danos indiretos, incidentais, especiais ou consequenciais</li>
              <li>Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses</li>
              <li>Não somos responsáveis por perda de dados, lucros, uso ou outras perdas intangíveis</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Isenções Específicas</h3>
            <p className="text-gray-700 mb-4">Não somos responsáveis por:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Decisões tomadas com base nos planejamentos gerados</li>
              <li>Falhas em projetos implementados seguindo nossas sugestões</li>
              <li>Incompatibilidades entre tecnologias sugeridas</li>
              <li>Prazos não cumpridos</li>
              <li>Problemas técnicos em projetos desenvolvidos</li>
              <li>Uso inadequado das informações fornecidas</li>
            </ul>
          </section>

          {/* Seções restantes de forma mais compacta */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. DISPONIBILIDADE DO SERVIÇO</h2>
            <p className="text-gray-700 mb-4">
              Podemos realizar manutenções programadas ou emergenciais, suspender temporariamente o serviço, 
              ou modificar recursos. Tentaremos notificar sobre manutenções com antecedência razoável.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. MODIFICAÇÕES</h2>
            <p className="text-gray-700 mb-4">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Mudanças significativas 
              serão notificadas por email, notificação na plataforma ou aviso na página de login. 
              O uso continuado após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. RESCISÃO</h2>
            <p className="text-gray-700 mb-4">
              Você pode encerrar sua conta a qualquer momento. Podemos suspender ou encerrar sua conta por 
              violação destes Termos, danos ao serviço, motivos legais, ou não pagamento de taxas devidas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. INDENIZAÇÃO</h2>
            <p className="text-gray-700">
              Você concorda em indenizar e isentar o Project Booster, seus operadores, funcionários e parceiros 
              de quaisquer reclamações, danos, perdas ou despesas decorrentes de seu uso do serviço, 
              violação destes Termos, violação de direitos de terceiros, ou seu Conteúdo de Usuário.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. DISPOSIÇÕES GERAIS</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Lei Aplicável:</strong> Estes Termos são regidos pelas leis da República Federativa do Brasil.</li>
              <li><strong>Foro:</strong> Qualquer disputa será resolvida no foro da comarca aplicável.</li>
              <li><strong>Divisibilidade:</strong> Se qualquer disposição for inválida, as demais permanecem em vigor.</li>
              <li><strong>Acordo Integral:</strong> Estes Termos constituem o acordo integral sobre o uso do serviço.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. CONTATO</h2>
            <p className="text-gray-700 mb-4">Para questões sobre estes Termos de Uso:</p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Email:</strong> contato@projectbooster.com.br</li>
              <li><strong>Website:</strong> https://projectbooster.com.br</li>
              <li><strong>Suporte:</strong> suporte@projectbooster.com.br</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. RECONHECIMENTO</h2>
            <div className="bg-primary/10 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold mb-4">AO USAR O PROJECT BOOSTER, VOCÊ RECONHECE QUE:</p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Leu e compreendeu estes Termos de Uso</li>
                <li>✓ Concorda em estar vinculado a estes Termos</li>
                <li>✓ Tem capacidade legal para aceitar estes Termos</li>
                <li>✓ Usará o serviço de acordo com estes Termos e leis aplicáveis</li>
              </ul>
            </div>
          </section>

          <div className="border-t pt-6 mt-8 text-center text-gray-600">
            <p className="mb-2"><strong>Data de Vigência:</strong> 14 de março de 2026</p>
            <p className="mb-4"><strong>Versão:</strong> 1.0</p>
            <p className="text-sm">© 2026 Project Booster. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms