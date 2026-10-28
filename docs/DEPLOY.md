# Deploy de prévia na Vercel

## Estado verificado em 28/10/2026

O acesso de escrita ao GitHub foi corrigido e o commit de implementação `ff6af75` foi enviado à branch `main` de `victor-lessa123/projeto`. O SHA remoto foi conferido e corresponde ao local. Os testes anteriores retornavam HTTP 403, mas esse bloqueio de escrita foi resolvido. A API do GitHub também está bloqueada pela política de rede atual, portanto não foi possível consultar segredos nem ambientes do repositório. Não há sessão/variável Vercel nem projeto `.vercel/project.json` neste ambiente. Não há deploy ou URL real de hospedagem confirmados. A revisão automática bloqueou a ação de envio do código para a Vercel por exigir autorização explícita do usuário para esse destino; essa ação não foi executada.

A configuração da nuvem recebeu um rascunho com requisito `VERCEL_TOKEN` e domínios `api.github.com`, `api.vercel.com`, `vercel.com` e `*.vercel.app`. O segredo só é destinado a `api.vercel.com`. Salvar o rascunho não injeta token, não aplica a rede e não faz deploy. Insira valores apenas nas configurações seguras do ambiente, nunca em chat ou no Git.

## Acesso ao GitHub

O envio ao repositório correto foi confirmado. Se a autorização voltar a falhar, conecte/autorize uma conta com permissão de escrita. Não substitua a origem nem use push forçado. Depois de corrigir a autorização, confira `git ls-remote origin refs/heads/main` e envie o commit local com `git push origin HEAD:main` se a branch aceitar atualização direta. Se houver proteção, envie uma branch e abra PR conforme as regras do repositório.

## Configurar o projeto Vercel

1. Crie ou importe **Network Jobs** na conta/time Vercel sob seu controle. Selecione Next.js e Node 24; não transforme a aplicação em exportação estática, pois Server Actions e autenticação precisam de servidor.
2. Mantenha a proteção de acesso ao preview ativada. Uma prévia não deve ser tratada como lançamento público.
3. Em GitHub → Settings → Secrets and variables → Actions, adicione o segredo `VERCEL_TOKEN` e as variáveis `VERCEL_ORG_ID` (ID da conta/time) e `VERCEL_PROJECT_ID` (ID do projeto). Esses valores ficam nas configurações, não em arquivos versionados.
4. No projeto Vercel, configure as variáveis de Preview necessárias. Sem Supabase, deixe suas duas variáveis ausentes; a aplicação mostra catálogo vazio e contas indisponíveis. Não insira chaves fictícias. Para ativar backend real, siga `SUPABASE.md` e use apenas a chave publishable no frontend.
5. Quando houver origem HTTPS conhecida, configure `NEXT_PUBLIC_SITE_URL` para ela e confira callbacks de autenticação. Não use a URL local como canonical de um preview remoto.
6. Após enviar o código, execute GitHub Actions → **Deploy Vercel preview** → Run workflow. Ele reutiliza a validação completa, baixa as configurações de Preview, compila, faz deploy prebuilt sem `--prod` e espera o estado de prontidão da Vercel. A URL retornada aparece no resumo da execução somente depois dessas etapas.

O workflow e a sintaxe CLI foram preparados, mas não executados contra a Vercel por falta de acesso. A Vercel pode requerer permissões adicionais do time para aceitar o autor do commit; corrija a associação da conta sem falsificar a autoria Git.

## Operação local alternativa após configurar acesso

CLI verificada: Vercel 65.5.0. Use uma sessão autenticada ou `VERCEL_TOKEN` injetado apenas para a API da Vercel. Nunca exponha a credencial em logs ou a salve no repositório. Vincule explicitamente o projeto pretendido, faça `vercel pull --environment=preview`, `vercel build` e `vercel deploy --prebuilt` (sem `--prod`). Aguarde `vercel inspect URL_REAL --wait` e então confira a home, busca, catálogo vazio e proteção de rotas no endereço retornado. Resposta de login da proteção Vercel não valida o conteúdo da aplicação.

## Condições antes de produção

Configurar e validar Supabase/SMTP, aplicar migração, testar as contas e permissões reais, definir controlador e contato de privacidade, revisar minutas jurídicas, fontes/permissões e anúncios. Não desative proteção de preview, RLS ou checagens para contornar falhas. O código envia `X-Robots-Tag: noindex, nofollow` quando `VERCEL_ENV=preview`; isso não substitui controle de acesso. O workflow não possui opção de produção.

## Prévia temporária sem conta

A ajuda oficial da CLI 65.5.0 também oferece `vercel deploy --temporary`, sem login. Essa opção não foi executada: o envio do código à Vercel foi bloqueado pela revisão automática e depende da autorização explícita do proprietário. Se autorizada, ainda é necessário aplicar a liberação de rede da API da Vercel. Uma prévia temporária não substitui deploy durável vinculado a projeto/conta nem validação de produção; prazo e condições devem ser conferidos no retorno do serviço antes de afirmar disponibilidade.
