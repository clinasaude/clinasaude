# CLINA — plano técnico de implementação

## Estado inicial importado
- Aplicação TanStack Start + React 19 + TypeScript + Tailwind CSS.
- Marketplace, landing page, planos e portais de paciente, profissional e administração.
- Identidade visual e componente central da logomarca presentes no código original.
- Regra de cálculo 20% plataforma / 80% profissional em `src/lib/finance.ts`.
- Os portais e dados financeiros/usuários usam dados locais demonstrativos. O fluxo de login apenas permite escolher um portal e não autentica usuários.

## Limites conhecidos
- Não há integração ativa com banco de dados nem autenticação real.
- Agendamentos, prontuários, diário emocional, fila de validação, assinaturas, pagamentos e auditoria são demonstrações locais.
- A teleconsulta ainda não tem provedor conectado.
- A sincronização GitHub da Lovable não foi confirmada. Este repositório foi inicializado separadamente a partir da leitura do projeto Lovable.
- A imagem original da logomarca precisa ser copiada como arquivo binário para `public/` ou `src/assets/`; o código original aponta para um asset gerenciado pela Lovable.

## Plano recomendado
1. **Fundação e execução local:** completar os arquivos originais, instalar dependências, configurar CI (typecheck, lint, testes, build), corrigir imports e caminhos de assets.
2. **Backend e identidade:** criar projeto Supabase de desenvolvimento, migrations versionadas, Auth, recuperação de senha, confirmação de e-mail e perfis; papéis autorizados devem vir de claims confiáveis (ex.: app_metadata), nunca de user_metadata controlável pelo usuário.
3. **Autorização e privacidade:** RLS em todas as tabelas expostas; negar por padrão; policies por proprietário e profissional responsável; validar acesso em operações de leitura e escrita; trilha de auditoria append-only; minimizar dados sensíveis.
4. **Marketplace e agenda:** perfis reais, validação profissional, disponibilidade, reservas com transações/constraints contra dupla reserva, cancelamento e notificações.
5. **Prontuário e diário:** acesso mínimo, consentimentos, segregação paciente/profissional, retenção e exportação; não usar dados reais até revisão de segurança e jurídica.
6. **Pagamentos:** integração server-side com Asaas, webhooks assinados/idempotentes, conciliação e estados de cobrança; split 20/80 conforme contrato e regras do provedor; nunca expor chaves secretas no navegador.
7. **Teleconsulta:** escolher provedor, gerar tokens apenas no servidor e controlar acesso pela sessão agendada; não prometer criptografia ponta a ponta sem validação técnica do provedor.
8. **Operação:** observabilidade sem conteúdo clínico em logs, backups, gestão de incidentes, testes de autorização e revisão LGPD/termos por profissionais habilitados.

## Secrets e dependências externas
Configurar somente no ambiente seguro do backend/CI, nunca commitar:
- Supabase: URL pública e anon key podem ser variáveis do frontend; service role/secret key exclusivamente server-side.
- Asaas: API key exclusivamente server-side; webhook token/segredo validado no servidor.
- E-mail transacional e teleconsulta: credenciais conforme o provedor escolhido.
Nenhum segredo foi criado, copiado ou publicado neste repositório.

## Critério de pronto
Nenhuma função clínica, financeira ou administrativa será considerada operacional até existir persistência real, autenticação/autorização testada, RLS verificada, testes automatizados e homologação de ponta a ponta. Este documento não constitui certificação de conformidade legal ou clínica.
