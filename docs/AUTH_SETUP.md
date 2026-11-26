# CLINA — configuração de autenticação

## O que já está implementado
- Supabase Auth com e-mail e senha.
- Cadastro público limitado ao perfil paciente.
- Criação automática de `public.profiles` no evento de criação de usuário.
- Confirmação de e-mail (conforme configuração do projeto Supabase).
- Recuperação e atualização de senha.
- Persistência e renovação automática da sessão no navegador.
- Portais paciente, profissional e administrador protegidos por sessão e papel.
- Papéis não podem ser alterados pelo próprio usuário; a função do JWT vem de `auth.users.raw_app_meta_data`, nunca de `raw_user_meta_data`.

## URLs de autenticação
No Supabase Dashboard, abra Authentication → URL Configuration e configure:
- Site URL: domínio publicado da CLINA.
- Redirect URLs: domínio publicado da CLINA com `/entrar`, e domínio de preview/desenvolvimento usado pela equipe.
- A recuperação retorna para `/entrar?redefinir=1`.

Não desative a confirmação de e-mail em produção. Configure SMTP transacional próprio antes de lançar para usuários reais.

## Como habilitar a conta administradora inicial
Execute no SQL Editor do projeto Supabase, substituindo o e-mail pelo e-mail exato da conta já cadastrada. Faça isso apenas para uma conta de confiança:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where email = 'SEU-EMAIL-ADMIN@DOMINIO.COM';

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'SEU-EMAIL-ADMIN@DOMINIO.COM');
```

Depois, saia e entre novamente para renovar o JWT. Não atribua o papel admin por formulário público ou `user_metadata`.

## Habilitação de profissional
O fluxo público ainda não cria nem aprova perfis profissionais. Após validar identidade e registro profissional, um administrador pode atribuir o papel confiável e revisar o perfil. A aprovação deve ser feita por processo administrativo, não pelo próprio profissional. O backend deve manter `raw_app_meta_data.role = 'professional'` e `public.profiles.role = 'professional'` sincronizados.

## Segurança e lançamento
- Nunca publicar service_role/secret key no frontend.
- Não inserir prontuários ou dados clínicos reais até concluir testes de isolamento entre pacientes e profissionais, auditoria, armazenamento privado e revisão LGPD.
- Configure os redirect URLs do domínio real antes de testar confirmação e recuperação de e-mail.
- A tela de login usa a chave publishable do projeto CLINA, que é pública por definição; a proteção dos dados depende das políticas RLS.
