# Continuidade — Network Jobs

## Estado atual

Implementação em `/workspace/projeto`, sobre o commit inicial do usuário. A implementação foi enviada à branch `main` de `victor-lessa123/projeto` (commit de código `ff6af75`); o SHA remoto foi conferido. A permissão de escrita foi corrigida após os primeiros erros 403. Nenhuma PR ou publicação em hospedagem foi confirmada. Leia README.md e docs antes de trabalhar. Use o checkout existente, sem criar worktree por padrão. Preserve mudanças locais.

Stack Next.js/React/TypeScript/Tailwind + integração Supabase SSR. Há home original responsiva, catálogo, filtros, detalhes, guias, páginas legais (minutas), contas, painel privado, favoritos, denúncias, empresas pendentes, revisão/admin, fontes, CSV autorizado e auditoria. RLS e constraints estão na migração; sem seeds públicos, fontes integradas ou oportunidades reais. Há CI preparado, ainda não executado remotamente.

Inicialmente o proprietário informou que não tinha projeto Supabase e pediu migrações/instruções prontas. Em 28/10/2026, informou que conectou Vercel (apelido “lessa”) e Supabase no painel Vercel; não há credenciais ou ferramentas desses serviços acessíveis nesta sessão para validar a integração real. Não invente URL, chave, SMTP ou disponibilidade de auth. O catálogo vazio é intencional, formulários de auth ficam indisponíveis sem variáveis. `docs/SUPABASE.md` contém os passos para provisionar, migrar, configurar redirects/SMTP e conceder admin com UUID real.

## Validação disponível

Lint, TypeScript, build, 36 testes unitários/SQL e 14 testes de navegador aprovados; ver docs/TESTES.md. Os testes SQL usam PGlite e identidade de teste, não Supabase Auth real. Os E2E são do modo **sem backend configurado**, em desktop e mobile. Capturas locais foram inspecionadas. Não afirmar que fluxo autenticado ou e-mail real foi validado.

Comandos: `npm ci`, `npm run dev`; validação `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Chromium já existe neste ambiente: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. O download padrão do Playwright foi bloqueado pela política. O Turbopack e o navegador precisam de portas/processos locais permitidos pelo executor.

O servidor dev pode estar rodando em porta 3000, mas processos não persistem necessariamente entre tarefas/publicações. Confirme antes de iniciar outro. Não crie links públicos de localhost. A configuração de ambiente recebeu script `npm ci`, instruções de startup e nomes das três variáveis; salvar rascunho não aplica migração nem publica site/ambiente.

## Próximos passos do proprietário

1. Criar Supabase, aplicar migração uma vez e configurar URL/chave publishable/origem do site nas opções do ambiente. Permitir o domínio exato do projeto na rede; preservar regras existentes. Recompilar depois de mudar variáveis públicas.
2. Configurar confirmação de e-mail, SMTP, redirects e limites antiabuso. CAPTCHA, se exigido para lançamento, precisa do widget e token; não foi integrado e não deve ser desativado para contornar erro.
3. Criar conta própria, confirmar e-mail e conceder admin no SQL editor conforme docs. Validar todas as rotas e operações autenticadas com pelo menos duas contas candidatas e duas empresas.
4. Definir controlador/contato de privacidade e suporte, revisar minutas jurídicas e regras atuais para adolescentes; configurar retenção/backups e conferir acessibilidade manualmente.
5. Cadastrar fontes com evidências de permissão, curar conteúdo real atual e aprovar cada anúncio. Não alegar parceria nem importar notícia agregada como vagas individuais.
6. Revisar alterações locais para commit/PR. Na Vercel, selecionar Next.js e Node 24, configurar variáveis e gerar preview. Publicação pública depende de revisão expressa das políticas, segurança e anúncios reais; não existe URL de deploy ainda.

## Decisões e limites a preservar

Nunca confiar no papel do cliente; nada de `service_role` no frontend. Publicação exige origem ativa e revisão; edição de empresa volta a pendente. Sem prazo, pedir confirmação à instituição e retirar após 30 dias sem revisão. Suspensão da fonte/organização retira visibilidade. Inscrições externas não são candidaturas enviadas pelo Network Jobs. Não inventar salários, vagas ou totais.

Sem alertas, currículos, candidaturas internas, scraping, recomendações ou analytics no MVP. `SourceAdapter` é só um contrato futuro. JSON-LD JobPosting aguarda dados reais e modelo confiável de contratante. Dados públicos não devem incorporar perfis privados; as políticas do banco são parte obrigatória da implementação. Não declarar prontidão de produção enquanto as pendências de Supabase, conteúdo e revisão permanecerem.

## Solicitação de commit/deploy em 28/10/2026

Deploy de prévia preparado em `.github/workflows/deploy-preview.yml`, com validação reutilizável e CLI Vercel 65.5.0 fixada. Não existe deploy confirmado: falta acesso de escrita no GitHub e autenticação/projeto Vercel. Consulte docs/DEPLOY.md. O rascunho da nuvem declara VERCEL_TOKEN para api.vercel.com e os destinos necessários; valores e aplicação das configurações dependem do proprietário. Não solicite novo token GitHub só por falha no CLI: o Git confirmou um bloqueio de autorização do usuário autenticado. `next-env.d.ts` é gerado e ignorado; typecheck agora roda `next typegen` antes de tsc para funcionar sem `.next` preexistente.

A revisão automática rejeitou o envio do código à Vercel por falta de autorização explícita para esse serviço. Não repetir esse upload sem autorização específica. Após o usuário pedir nova conferência, o GitHub continuou retornando 403 para a identidade `mjm5299545-source`. Corrigir autorização da conta ou conceder escrita no repositório; não trocar origem ou forçar push. A CLI oficial possui prévia temporária sem login, mas isso não libera a política de rede nem substitui a autorização de envio.

## Atualização de entrega ao GitHub em 28/10/2026

O teste de escrita passou e o push do commit `ff6af75` foi concluído. O SHA completo foi comparado com `refs/heads/main` remoto e é idêntico. Os relatos anteriores de 403 são histórico já resolvido. Acompanhamento do CI remoto não foi confirmado. O deploy continua pendente de autorização explícita para enviar o código à Vercel e de acesso de rede/configuração do serviço. O ZIP pode ser obtido diretamente pelo GitHub a partir do commit/branch enviados, evitando a exportação de artefatos da interface.

## Reconhecimento da integração Supabase/Vercel

A configuração foi centralizada em `lib/db/config.ts`: aceita URL pública ou `SUPABASE_URL` e chave pública publishable/anon, com os nomes `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_ANON_KEY`. Servidor, proxy de sessão e CSP usam a mesma configuração. Não há fallback para service_role nem senha SQL. Foram adicionados sete testes de compatibilidade; a suíte local agora tem 43 testes. O proprietário ainda precisa fornecer a URL pública do site para diagnóstico externo; as variáveis, o redeploy, a migração SQL e os callbacks de autenticação não foram conferidos na Vercel/Supabase reais. Ver o checklist em docs/SUPABASE.md.
