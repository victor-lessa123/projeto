# Segurança e privacidade

## Controles implementados

- Identidade validada no servidor; RLS em todas as tabelas, incluindo auditoria e limites.
- Papel admin fora de formulários; perfis não públicos e edição limitada a nome/município.
- Empresa sempre pendente; aprovação de organizações/fontes/anúncios somente por admin.
- Modificações da empresa removem publicação; constraints de idade e gratuidade de cursos; revisão humana obrigatória para todos os anúncios.
- Sessão Supabase SSR, cookies Secure em produção e SameSite=Lax. Server Actions verificam origem conforme Next.js; callback só aceita destinos internos predefinidos.
- Validação Zod no servidor, SQL parametrizado, escaping padrão React; sem `dangerouslySetInnerHTML`, upload, fetch arbitrário ou candidatura interna.
- Links HTTPS sem credenciais, IP literal ou encurtadores conhecidos; `noopener noreferrer` nos links externos. Isso não detecta todo phishing: revisão humana continua necessária.
- Rate limit persistente para anúncios/edições/denúncias; autenticação usa limites do provedor.
- CSP, proteção de enquadramento, `nosniff`, Referrer-Policy e Permissions-Policy. CSP ainda permite inline necessário ao Next; nonce deve ser avaliado.
- Exclusão de conta remove dados vinculados e desassocia ator de auditoria. Contas admin precisam transferir responsabilidades antes da exclusão.
- Sem analytics, rastreamento comportamental, currículos ou documentos pessoais. Dados de adolescentes não são enviados a recrutadores.

## Bloqueadores de lançamento

Configurar Supabase/SMTP, verificar toda a migração no serviço real, testar fluxos completos e e-mails. Definir controlador, canal de privacidade e suporte, base legal por finalidade (especialmente adolescentes), procedimentos de direitos e retenção. As páginas legais são minutas. Nenhuma declaração de conformidade definitiva.

Revisar profissionalmente regras atuais de aprendizagem, estágio, trabalho de menores e critérios editoriais. As referências jurídicas do prompt não foram verificadas nesta execução. Restrições automatizadas de idade são barreiras mínimas, não análise jurídica.

Configurar antiabuso de auth, proteção na borda e, conforme avaliação, CAPTCHA com widget/token nos formulários. Não há rate limit local de login que substitua o provedor. Mensagens de recuperação/cadastro são neutras para reduzir enumeração. O bloqueio de fontes suspeitas não é uma lista completa de phishing.

Auditar com leitor de tela, contraste em todos os estados e usuários reais. Configurar retenção e remoção de backups, observabilidade sem dados pessoais, proteção do acesso admin/MFA no provedor e rotina de recuperação.

## Proposta de retenção

Conta ativa: dados mínimos necessários. Exclusão por painel: remoção de conta, perfil, favoritos, organização/anúncios quando vinculados e denúncias; auditoria perde ator. Proposta de até 180 dias para auditoria de moderação, sujeita a revisão jurídica. Não há job de retenção instalado. O operador deve configurar e validar a limpeza antes da operação pública.
