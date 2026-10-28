# Arquitetura

Aplicação única: Next.js 16.4.3, React 19.3.1, TypeScript estrito e Tailwind CSS 4. Versões obtidas no registro npm e travadas no lockfile. Node 24 é o runtime validado; não há microserviços, filas nem cache distribuído. Fontes locais do sistema evitam dependência de Google Fonts. A arte da home é CSS/SVG original; não usa marcas de terceiros.

- `app`: rotas e Server Actions; não usa mock ou localStorage para persistência.
- `components`: UI compartilhada, busca, formulários e preview CSV.
- `lib/auth` e `proxy.ts`: sessão Supabase SSR, refresh de cookies, validação de identidade com `getUser` e guardas no servidor. O proxy não substitui RLS.
- `lib/db`: consultas paginadas e catálogo público.
- `lib/validation`, `lib/security`: validação Zod, limites e URLs HTTPS sem credenciais, IPs literais ou encurtadores conhecidos. Nenhum importador busca URLs arbitrárias.
- `lib/sources`: contrato `SourceAdapter` e parser CSV; nenhum adaptador remoto está integrado.
- `supabase/migrations`: PostgreSQL, índices, constraints, RLS, funções de moderação e auditoria.

## Modelo e invariantes

`profiles` referencia Supabase Auth e começa sempre como candidato, ignorando qualquer `role` nos metadados do cadastro. RPC restrita transforma uma conta confirmada em empresa com organização pendente. Admin é concedido somente pelo proprietário no SQL editor, nunca por formulário. Alteração direta de `profiles.role` não é concedida a clientes.

`organizations` e `sources` precisam de aprovação. `opportunities` unifica vagas, cursos e eventos com discriminador `kind`; cursos exigem gratuidade. Publicação depende de aprovação, revisão de segurança explícita, justificativa, origem ativa e prazo válido. Suspender qualquer fonte/organização vinculada esconde os anúncios. Edição por empresa limpa verificação e retorna a pendente. Não é permitido mudar autoria/organização por uma empresa.

Busca textual usa dicionário português com remoção de acentos, ranking por `ts_rank_cd` e recência. Campos como município/área são filtros de igualdade; escolaridade é busca parcial. Paginação usa 12 resultados públicos ou 20 administrativos. Faixa etária apenas filtra requisitos declarados, sem determinar elegibilidade.

`favorites`, `reports` e `consents` são privados por usuário. `audit_logs` registra ator, entidade, decisão e motivo de moderação; sem copiar perfis ou conteúdo de denúncia. O banco mantém a contagem de envios por usuário (10 anúncios novos, 30 edições e 5 denúncias por hora). Cadastro/login/recovery dependem também dos limites e mecanismos antiabuso do Supabase.

## Execução sem Supabase

Páginas públicas e busca funcionam com estado vazio. Login/cadastro ficam indisponíveis com aviso. Falha de conexão é diferenciada de resultado vazio. Não há banco simulado de produção. PGlite executa PostgreSQL apenas nos testes; o pequeno esquema `auth` de teste substitui exclusivamente a identidade para verificar RLS, não implementa Supabase Auth.

## Limites deliberados e pendências

Sem candidatura interna, alertas, currículos, uploads, scraping ou cron. Edições e inscrições não fazem envio automático de candidaturas. Não há ambiente Supabase externo nem SMTP configurados; os fluxos completos autenticados ainda precisam ser validados nele. Banco gerenciado não é criado automaticamente. A revisão editorial exige pessoa responsável; a ferramenta não decide legalidade sozinha.

Não é emitido JSON-LD `JobPosting`: ainda não há catálogo real nem estrutura separada de empresa contratante para garantir os campos exigidos. Oportunidades reais podem receber esse enriquecimento após curadoria. CSP permite scripts inline do Next.js; política com nonce é uma melhoria de defesa adicional antes de exposição ampla.
