# CLINA — execução técnica e operação

## Estado atual
O repositório contém a interface inicial importada do Lovable. Até que os serviços sejam conectados, as telas que usam dados locais devem ser consideradas demonstração, não prontuário ou operação clínica real.

## Arquitetura-alvo
- Aplicação: React + TypeScript + TanStack Start.
- Identidade e dados: Supabase Auth + PostgreSQL + Row Level Security.
- Arquivos: Supabase Storage com buckets privados para documentos clínicos e materiais restritos.
- Pagamentos: Asaas, com criação/cancelamento e confirmação exclusivamente no servidor por webhook autenticado.
- Teleconsulta: provedor com salas privadas e tokens temporários emitidos no servidor.
- E-mail: provedor transacional para confirmação, lembretes e eventos de conta.
- CI: GitHub Actions executa typecheck, lint, testes e build em PRs e pushes.

## Variáveis de ambiente
Nunca commitar segredos. Configurar apenas no ambiente de deploy/Supabase:
- `VITE_SUPABASE_URL`: URL do projeto.
- `VITE_SUPABASE_ANON_KEY`: chave publicável/anon (pode ir ao navegador; RLS é obrigatória).
- `ASAAS_API_KEY`: segredo do Asaas, apenas servidor.
- `ASAAS_WEBHOOK_TOKEN`: token de autenticação do webhook, apenas servidor.
- `VIDEO_PROVIDER_API_KEY`: chave do provedor de vídeo, apenas servidor.
- `EMAIL_PROVIDER_API_KEY`: chave do provedor de e-mail, apenas servidor.

Nunca usar `service_role`, secret key ou chaves privadas em variáveis `VITE_*`.

## Banco
A primeira migração em `supabase/migrations` cria o modelo base de perfis, profissionais, disponibilidade, consultas, registros clínicos, diário emocional, pagamentos, assinaturas, cursos, tentativas, certificados e auditoria. Todas as tabelas em `public` ativam RLS.

A migração é uma base inicial e precisa ser revisada com assessoria jurídica/encarregado LGPD e profissionais responsáveis antes de receber dados reais. Regras clínicas, retenção, consentimento, direitos do titular, prontuário e requisitos de cada conselho profissional devem ser formalizados.

## Regras críticas
1. Papel de autorização vem de `app_metadata`, definido por backend confiável; nunca de `user_metadata`.
2. O navegador recebe somente chave publicável. Segredos ficam em Edge Functions/servidor.
3. Registros clínicos são restritos a profissional vinculado e paciente correspondente; admin deve ter acesso operacional auditável e justificado.
4. Webhooks são a fonte de verdade para pagamento; não confiar em retorno do navegador.
5. Nunca liberar links permanentes de teleconsulta; gerar tokens/salas privados e temporários.
6. Não colocar dados de saúde em logs, analytics, e-mails ou metadados desnecessários.
7. Não habilitar produção até testar RLS com usuários paciente, profissional, administrador e anônimo.

## Próximos passos de ativação
1. Conectar/criar o projeto Supabase da CLINA e aplicar a migração.
2. Configurar Auth (e-mail, confirmação, recuperação, URLs autorizadas) e atribuição de papéis pelo servidor.
3. Configurar Storage privado e políticas por proprietário/consulta.
4. Implementar clientes Supabase e substituir cada conjunto de mocks por consultas tipadas.
5. Implementar Edge Functions para pagamentos, webhook Asaas, emissão de links de vídeo e e-mails.
6. Configurar segredos no Supabase e variáveis públicas no deploy.
7. Executar testes automatizados e testes manuais de isolamento RLS antes de importar qualquer dado real.

## Pagamentos e divisão
A regra comercial de referência é 20% CLINA / 80% profissional. O backend deve calcular os valores em centavos e persistir o detalhamento, validar limites e idempotência, e reconciliar os eventos do Asaas. A implementação final depende da configuração da conta Asaas, split habilitado e dados cadastrais/contratuais dos recebedores.

## Aviso de segurança
Não utilizar dados reais de pacientes, documentos, diagnósticos ou anotações clínicas até que autenticação, RLS, Storage privado, auditoria, backups, resposta a incidentes e revisão profissional/jurídica estejam concluídos.
