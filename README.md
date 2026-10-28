# Network Jobs

Portal em português para aprendizagem, estágio, primeiro emprego e capacitação gratuita, inicialmente em Sergipe. Gratuito para candidatos. Projeto implementado sobre Next.js, TypeScript, Tailwind e Supabase; sem anúncios inventados nem integração presumida com instituições.

**Estado:** páginas e validação local disponíveis. Banco/autenticação externos ainda não configurados por decisão do proprietário. Não é um lançamento de produção. O catálogo inicia vazio; contas ficam indisponíveis sem Supabase e falhas não simulam sucesso.

## Rodar

Node 24 (ver `.nvmrc`) e npm:

```sh
cd /workspace/projeto
npm ci
npm run dev
```

O dev server usa porta 3000. Para conectar contas e dados, configure `.env.local` a partir de `.env.example` e siga [Supabase](docs/SUPABASE.md). Nunca use chave `service_role` no frontend. Nenhuma variável secreta é incluída no repositório.

## Recursos implementados

- Home responsiva original, busca textual em português com filtros na URL, paginação e catálogo separado de cursos gratuitos.
- Detalhes com proveniência, verificação, requisitos, prazo e inscrição **externa**, sem fingir envio de candidatura.
- Fluxos Supabase de cadastro, confirmação, login, logout, recuperação de senha e exclusão; perfil privado, favoritos e denúncias.
- Empresa começa pendente; criação/edição/encerramento de anúncios com revisão humana. Edição remove publicação anterior.
- Admin protegido no servidor/banco: moderação, fontes, empresas, denúncias, usuários mínimos, auditoria, curadoria manual e CSV autorizado com preview.
- Constraints e RLS, rate limits de gravação, expiração por prazo ou 30 dias sem nova verificação, avisos jurídicos e educativos.

Os fluxos dependentes de auth/banco são código implementado com políticas testadas localmente, **não integração Supabase real validada**. Não há alertas, candidatura interna, currículos, scraping, analytics, monitoramento de links ou parceiros oficiais.

## Verificar

```sh
npm run lint
npm run typecheck
npm test
npm run build
# Em máquina com browsers Playwright:
npx playwright install --with-deps chromium
npm run test:e2e
# Neste ambiente, utilize o Chromium existente:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Os E2E atuais validam a experiência **sem Supabase**, em desktop e mobile. Os testes de banco executam a migração em PostgreSQL/PGlite, com identidade `auth.uid()` controlada exclusivamente pelo teste. Não substituem teste de SMTP, sessão ou API REST do Supabase real. Veja [resultados e limites](docs/TESTES.md).

## Publicação preparada

Há CI em `.github/workflows/ci.yml` e deploy manual de prévia em `.github/workflows/deploy-preview.yml`; o código já foi enviado à branch `main` do GitHub. O resultado dos workflows remotos ainda precisa ser acompanhado em Actions. Na Vercel selecione framework Next.js, Node 24, `npm ci`, `npm run build` e configure as três variáveis de `.env.example`. Aplique a migração no Supabase antes de usar contas. Configure origem HTTPS, redirects de auth, SMTP e proteções antiabuso. Nunca publique minutas jurídicas como políticas finais.

**Não há URL real de preview ou produção.** O envio ao GitHub foi confirmado. Não houve deploy nem criação de projeto de hospedagem externo. Publicação pública exige revisão das políticas, segurança e anúncios reais pelo responsável, conforme o documento de requisitos.

## Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [Configurar Supabase](docs/SUPABASE.md)
- [Deploy de prévia e requisitos de acesso](docs/DEPLOY.md)
- [Fontes e permissões](docs/FONTES_E_PERMISSOES.md)
- [Segurança e privacidade](docs/SEGURANCA_E_PRIVACIDADE.md)
- [CSV](docs/CSV.md)
- [Testes](docs/TESTES.md)
- [Roadmap](docs/ROADMAP.md)
- [Continuidade](CONTINUIDADE_CODEX.md)
