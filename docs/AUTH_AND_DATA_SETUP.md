# CLINA — autenticação e dados persistentes

## Projeto conectado
- Supabase project ref: `kpsxjcorglvovolsmcrf`
- API URL: `https://kpsxjcorglvovolsmcrf.supabase.co`
- O cliente web usa exclusivamente a chave publishable (nunca service_role).

## Persistência
O banco contém `profiles`, `appointments`, `medical_records`, `emotional_entries`, `evaluations` e os perfis profissionais. Views em português `perfis`, `agendamentos`, `prontuarios`, `diario_emocional` e `avaliacoes` preservam as policies RLS das tabelas base via `security_invoker=true`.

## Papéis
Novos cadastros são pacientes por padrão. A role fica na tabela `profiles`; o trigger bloqueia alterações de role pelo próprio usuário. A promoção a profissional/admin deve ocorrer por procedimento confiável e auditado, nunca por `user_metadata`.

## E-mail e senha
O frontend já chama `signUp`, `signInWithPassword`, reset de senha e atualização de senha via Supabase Auth. O trigger `auth.users -> private.handle_new_user` cria o perfil automaticamente.

## Google OAuth — ação de configuração ainda necessária
O código do botão usa `signInWithOAuth({provider:"google"})`, mas o provedor precisa ser ativado no Dashboard:
1. Em Google Cloud Console, crie um OAuth Client do tipo Web.
2. Configure a origem autorizada com o domínio final do site CLINA.
3. Configure o redirect URI de callback informado na página de Google Provider do Supabase: `https://kpsxjcorglvovolsmcrf.supabase.co/auth/v1/callback`.
4. No Supabase Dashboard, abra Authentication → Sign In / Providers → Google, habilite e informe Client ID e Client Secret.
5. Em Authentication → URL Configuration, adicione o domínio de produção e o endereço de desenvolvimento à Redirect URLs, incluindo `/entrar`.
6. Faça teste de login Google com uma conta nova e confirme que um registro em `auth.users` e `profiles` foi criado com role `patient`.
Nunca commitar Client Secret, service_role ou chaves privadas no GitHub.

## Testes e produção
- O banco está atualmente sem usuários reais; autenticação e fluxos exigem teste funcional com contas separadas.
- Prontuários têm policy exclusiva para o profissional titular; pacientes e admins não têm SELECT/INSERT/UPDATE/DELETE.
- O Supabase Security Advisor ainda reporta duas funções SECURITY DEFINER expostas por RPC (`book_clina_appointment` e `review_clina_professional`) e `audit_logs` sem policy (nega acesso por padrão). Revisar privilégios e validar o corpo das funções antes de produção.
- Não inserir dados clínicos reais até concluir testes de autorização, política de retenção, backup, resposta a incidentes, consentimentos e revisão LGPD/CFP.
