# CLINA — hardening de segurança do banco

## Estado verificado no projeto Supabase
Projeto: `kpsxjcorglvovolsmcrf`.

- RLS está ativado em todas as 14 tabelas do schema público.
- Privilégios SQL foram reduzidos para o mínimo necessário por tabela/coluna; não há privilégios de tabela concedidos a `anon`.
- A listagem pública de profissionais expõe somente campos de diretório; dados internos do perfil não são disponibilizados ao visitante.
- A agenda pública permite apenas leitura de horários disponíveis.
- Apenas profissionais com perfil aprovado podem criar, alterar ou excluir seus horários; administradores podem gerenciar.
- O conteúdo das aulas é visível somente a usuários matriculados e administradores.
- Prontuários exigem autenticação e políticas de participante/profissional/admin; atualizações são restritas ao profissional responsável ou admin.
- A tabela `audit_logs` não possui política nem concessão de acesso aos clientes, intencionalmente reservada a operações de servidor.

## Verificações executadas
- `list_migrations`: histórico remoto conferido.
- Consulta a `pg_tables/pg_class`: RLS ativo nas 14 tabelas.
- Consulta a `pg_policies`: políticas de agenda, prontuário e conteúdo de cursos conferidas.
- Consulta a `information_schema.role_table_grants`: nenhuma concessão de tabela ao papel `anon`.
- Supabase Security Advisor: nenhum alerta externo de alta gravidade; único aviso informativo é `audit_logs` com RLS e sem política, por desenho.
- Performance Advisor: índices ainda não utilizados em ambiente sem carga real; manter por ora e reavaliar após tráfego.

## Limites antes de produção
- Ainda faltam testes automatizados com usuários reais de papéis diferentes para provar isolamento entre pacientes/profissionais.
- Upload de apostilas deve usar bucket privado e URLs assinadas; não publicar PDFs clínicos em links públicos.
- Matrículas, tentativas, pagamentos e certificados devem ser criados/atualizados por funções de servidor confiáveis, não por gravação direta do navegador.
- Agendamentos e pagamentos ainda precisam de endpoints transacionais e integração real com provedor.
- A revisão LGPD, retenção, consentimento, trilha de auditoria e resposta a incidentes permanece necessária antes de inserir dados reais de saúde.

**Não utilizar dados clínicos reais até concluir os testes de autorização, armazenamento privado, processos de auditoria e revisão LGPD.**
