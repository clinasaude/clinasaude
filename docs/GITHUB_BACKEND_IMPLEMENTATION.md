# CLINA — backend integrado via GitHub

## Arquitetura
O frontend usa o projeto Supabase externo CLINA já existente (project ref `kpsxjcorglvovolsmcrf`) por meio de uma chave publishable. O Lovable Cloud é um ambiente separado e não faz parte desta configuração.

## Alterações nesta branch
- Removeu os profissionais fictícios de `src/lib/data.ts`; restaram apenas listas estáticas de filtros.
- Criou `src/lib/clina-data.ts` para consultas reais de profissionais aprovados, horários, agendamentos, diário emocional, validação, prontuários e transações.
- Conectou o marketplace à consulta de perfis profissionais aprovados.
- Adicionou autenticação Google no cliente; a ativação ainda exige configurar Google OAuth no painel Supabase (Client ID/Secret e URLs de redirecionamento).
- Substituiu os portais paciente, profissional e admin por telas ligadas aos registros reais, com estados vazios quando não há dados.
- Removeu exemplos clínicos e financeiros fictícios dos portais.
- Adicionou migração aditiva de backend com `medical_records`, `transactions`, diário por data, controles de acesso e RPCs de agendamento/validação.

## Migração
Arquivo: `supabase/migrations/20261126030000_clina_backend_security_and_workflows.sql`.

A migração foi escrita para o schema atualmente existente no Supabase CLINA. Aplicar somente ao projeto ref acima após revisão. Ela não foi aplicada automaticamente por esta branch.

## Configuração de autenticação
- Email/senha já implementado.
- Google OAuth: ativar Google no Supabase Auth, cadastrar Client ID/Secret do projeto Google Cloud, adicionar callback Supabase e URLs de redirecionamento do domínio de produção e localhost.
- Roles são lidas da tabela protegida `profiles`, não de `user_metadata`.

## Limitações operacionais ainda abertas
- Daily.co: criar Edge Function segura, configurar `DAILY_API_KEY`, criar salas privadas por consulta e validar webhooks. Nenhum link de sala é inventado.
- Pagamentos: integração Asaas e webhooks confiáveis ainda não implementados; a tabela transactions não significa que houve cobrança ou repasse.
- Documentos profissionais: falta bucket privado e fluxo de upload/visualização temporária, com validação de MIME/tamanho.
- Cadastro profissional: falta formulário completo e consentimento/documentos.
- A tela admin só aprova cadastros existentes; não exibe documentos até existir fluxo privado de upload.
- Ainda faltam testes automatizados RLS multiusuário e execução local de lint/typecheck/build. Não usar prontuários reais antes da validação independente de segurança e revisão LGPD/CFP.

## Dados e privacidade
Nenhum dado de demonstração foi convertido em dado real. Não inserir dados clínicos de pacientes antes de consentimento, vínculo profissional, revisão de retenção, canal de direitos do titular e avaliação jurídica/encarregado LGPD.
