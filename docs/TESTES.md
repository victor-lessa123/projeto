# Testes e evidências

Executados em 27/10/2026 no ambiente de nuvem, Node 24.19.0. Nenhuma credencial de Supabase/SMTP configurada.

| Verificação                                                              | Resultado                                                                                                                          |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                                                           | passou, sem avisos na última execução                                                                                              |
| `npm run typecheck`                                                      | passou                                                                                                                             |
| `npm test`                                                               | 36 testes passaram em 2 arquivos; 19 de validação e 17 de PostgreSQL/RLS                                                           |
| `npm run build`                                                          | passou; páginas públicas, privadas e proxy compilados                                                                              |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` | 14 testes passaram em desktop (1440×1000) e mobile (390×844)                                                                       |
| Axe-core (dentro dos E2E)                                                | nenhuma violação detectada nas regras WCAG 2 A/AA, 2.1 AA e 2.2 AA analisadas em home, catálogo e cadastro, após conteúdo completo |
| `npm audit --omit=dev` online                                            | nenhuma vulnerabilidade reportada para dependências de produção na data da execução                                                |
| `npm ci` | reinstalação pelo lockfile passou |
| `npm run dev` + HTTP local | home e catálogo responderam com título e estado vazio esperados |
| `git diff --check`                                                       | passou                                                                                                                             |

## O que foi exercitado

Busca por palavra/cidade e combinação de modalidade/experiência na URL; limpar filtros e catálogo vazio real. Rotas privadas redirecionam visitante para login; cadastro indisponível sem backend. Guias e páginas legais; foco no link de pular conteúdo; ausência de overflow horizontal; resposta HTTP 404 de oportunidade inexistente; CSP e `nosniff`. Capturas reais de desktop/mobile geradas em `test-results/` (ignorado pelo Git) e inspecionadas visualmente.

O PostgreSQL/PGlite executa a migração completa (incluindo extensões), com papéis `anon` e `authenticated`, e um esquema `auth` mínimo **exclusivamente de teste**. Verifica: metadados de signup não elevam papel; cliente não altera `profiles.role`; dados privados entre candidatos; isolamento entre empresas; publicação negada antes de verificação/revisão; busca sem acentos; favoritos e denúncias privados; quota de denúncias; suspensão de empresa e fonte; expiração e revisão antiga; unicidade de URL; exigência de confirmação de e-mail para organização; proteção de evidência/auditoria; edição retorna anúncio a pendente; idades/URLs inválidas; exclusão de conta e dados vinculados. Fixtures sintéticas não são carregadas na aplicação.

## Falhas encontradas e corrigidas

- Primeira compilação no sandbox falhou porque Turbopack precisa abrir porta local temporária. Build repetido com a permissão de execução apropriada passou, sem desativar verificação de artefatos.
- Download do browser Playwright foi negado (`cdn.playwright.dev`, 403). Foi usado o Chromium já instalado em `/usr/bin/chromium`, sem contornar a política de rede.
- Seletores de teste foram ajustados para papéis acessíveis de `combobox` no datalist e nos selects.
- Páginas inexistentes retornavam 200 por streaming com loading na raiz. O loading global foi removido, metadados são resolvidos antes do streaming e `notFound()` é validado no detalhe. O teste de HTTP 404 passou depois da correção. Envios de formulários têm estado pendente explícito com `useFormStatus`.
- Tipagem da seleção de RPC e APIs do runner foram corrigidas antes da execução final.

## Não executado / ainda necessário

- Aplicar e conferir a migração em **Supabase real**, API REST e auth do provedor.
- Cadastro/confirmação via e-mail, login/recovery/logout com sessão real; navegação autenticada de favoritos, empresa, moderação, denúncias e exclusão ponta a ponta no navegador.
- Falha de conexão real com provedor, restauração de backup e aplicação de retenção. Há estados de erro implementados, mas não houve provedor externo conectado para exercitá-los.
- Testes com leitores de tela e usuários, auditoria manual completa de contraste/acessibilidade; axe não é certificação.
- Verificação de conteúdo real, permissões das instituições e legislação atual; não há oportunidades públicas inseridas.
- CI remoto, deploy Vercel e validação em tarefa nova após publicar o ambiente.
- Não houve chave secreta real para teste dinâmico de vazamento. Nenhuma service key é usada; variáveis públicas previstas são URL, chave publishable e origem do site.

Os testes automatizados não autorizam produção com minutas jurídicas, sem SMTP e sem validação da integração real.
