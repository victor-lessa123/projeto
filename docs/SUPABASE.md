# Conectar o Supabase

1. Crie um projeto Supabase em região apropriada após avaliar privacidade e residência dos dados. Guarde a senha administrativa apenas em cofre seguro.
2. Em SQL Editor, execute **uma vez** `supabase/migrations/202610270001_network_jobs.sql`. Alternativamente use Supabase CLI com projeto vinculado e `supabase db push`. Não execute a migração novamente num banco já migrado; mudanças futuras exigem migrações novas.
3. Configure as variáveis a partir de `.env.example`. Localmente use `.env.local` ignorado pelo Git. No ambiente de nuvem e na Vercel use configurações de variáveis. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` é a chave **pública/publishable** do projeto, jamais `service_role` ou chave secreta. A RLS é o limite de segurança, não o sigilo dessa chave.
4. Defina `NEXT_PUBLIC_SITE_URL` para a origem HTTPS final, sem caminho. Em desenvolvimento local use `http://localhost:3000` com `npm run dev`. Uma execução production (`npm start`) exige HTTPS para cookies seguros. Para desenvolvimento por endereço remoto, use origem HTTPS acessível apropriada.
5. Em Authentication → URL Configuration, configure Site URL e permita exatamente `ORIGEM/auth/callback` (inclusive `?next=/redefinir-senha` quando necessário pelo provedor). Cadastre também a origem local para desenvolvimento, sem wildcard amplo de produção.
6. Mantenha confirmação de e-mail habilitada, configure SMTP de produção, senha mínima de 12 caracteres, expiração de links, limites de signup/login/recovery e proteção CAPTCHA/WAF apropriada. Sem SMTP, o serviço padrão possui limites e restrições; não declare envio universal funcionando. CAPTCHA não está integrado aos formulários atuais: se ativado no Supabase, adicione o widget e o token antes de liberar cadastro; não desative a proteção para contornar falhas. Faça essa integração como tarefa de hardening.
7. Crie sua conta pelo formulário, confirme o e-mail e confira seu UUID em Authentication → Users. Conceda admin pelo SQL Editor, substituindo apenas pelo UUID da conta realmente controlada pelo proprietário:

```sql
update public.profiles set role = 'admin'
where id = '<UUID_DO_PROPRIETARIO>'::uuid;
```

Não há credencial administrativa padrão. Não coloque esse comando em formulário, seed público ou ação que aceite um papel do cliente. Remoção de admin também exige o operador do banco; admin não pode excluir a própria conta por RPC.

8. Reinicie o dev server ou refaça o build depois de mudar variáveis `NEXT_PUBLIC_*`. Teste cadastro/confirmação/login/recovery/logout, registro pendente da empresa, moderação por outra conta admin, favoritos, denúncias e exclusão. Verifique os cookies em domínio HTTPS.
9. Antes de conteúdo real, revise fontes e permissões, publique contato do controlador, aprove políticas jurídicas e configure retenção de auditoria/backups. Faça teste restaurando um backup. Nunca deixe service keys no navegador.

## Conferências de acesso

Teste com duas contas candidatas e duas empresas. Candidate A não deve ler perfil/favoritos/denúncias de B via API REST. Empresa A não deve ler ou alterar anúncios privados de B. A chamada direta de update em `profiles.role` deve falhar. Use os JWTs de cada conta apenas no cliente de teste seguro; não os cole em logs ou relatórios.

## Operação

Registros sem prazo deixam de ser públicos após 30 dias sem nova verificação; os que têm prazo vencem no horário salvo. Renovação exige admin revisar novamente. Suspensão de origem esconde anúncios imediatamente pelas políticas do banco. Não há verificador de links nem scheduler. Agende limpeza revisada de `audit_logs` (proposta de 180 dias) e monitore backups/erros antes do lançamento. A tabela de limites guarda uma linha por usuário/ação, não uma linha por requisição.

## Já conectei Supabase pela Vercel, mas o site continua desconectado

A conexão entre os serviços não aplica automaticamente as tabelas e políticas deste aplicativo. Confira em Project → Settings → Environment Variables, sem compartilhar valores:

- URL da API: `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_URL`.
- Uma chave pública: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY` ou `SUPABASE_ANON_KEY`, nessa ordem de preferência. O código aceita os nomes modernos e os nomes legados usados por integrações. Não usar `service_role`, chave secreta nem senha de banco nesses campos.
- Origem do site: `NEXT_PUBLIC_SITE_URL` precisa ser a URL HTTPS real do site para cadastrar contas e recuperar senha. Ela também deve constar nas configurações de redirect do Supabase.

Selecione o ambiente correto para as variáveis (Production para o domínio principal, Preview para prévias). Depois de salvar, faça **Redeploy**: variáveis `NEXT_PUBLIC_*` são incorporadas durante o build e o deploy anterior não passa a reconhecê-las automaticamente.

Se o aviso mudar de “Catálogo ainda não conectado” para falha de consulta, confira se a migração SQL deste repositório foi aplicada **uma vez** no projeto Supabase conectado. A integração Vercel/Supabase não cria `profiles`, `opportunities` e `public_catalog` por conta própria. Catálogo conectado sem anúncios aprovados continuará vazio, corretamente. Sem acesso aos serviços reais, os testes de configuração local não comprovam que o projeto remoto está conectado.
