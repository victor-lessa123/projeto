import { Submit } from "@/components/submit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { Catalog, Field, Heading, Notice } from "@/components/ui";
import { configured } from "@/lib/db/server";
import { signIn, signUp, recover, changePassword } from "@/app/actions";
import { requireUser } from "@/lib/auth/session";
import type { Params } from "@/lib/db/catalog";
const categories: Record<string, [string, string]> = {
  "jovem-aprendiz": ["aprendiz", "Jovem Aprendiz: aprender trabalhando."],
  estagios: ["estagio", "Estágios: um encontro entre estudo e prática."],
  "primeiro-emprego": ["emprego", "Seu primeiro emprego começa com uma busca."],
};
const authTitles: Record<string, string> = {
  entrar: "Bom ter você por aqui.",
  cadastro: "Seu próximo começo.",
  "recuperar-senha": "Vamos recuperar seu acesso.",
  "verificar-email": "Confira seu e-mail.",
  "redefinir-senha": "Escolha uma nova senha.",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  return {
    alternates: { canonical: `/${page}` },
    title:
      content[page]?.title ||
      authTitles[page] ||
      categories[page]?.[1] ||
      "Network Jobs",
    ...(authTitles[page] ? { robots: { index: false, follow: false } } : {}),
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<Params>;
}) {
  const { page } = await params;
  const query = await searchParams;
  if (categories[page])
    return (
      <div className="content-shell">
        <Catalog
          params={{ ...query, kind: categories[page][0] }}
          title={categories[page][1]}
        />
        <p className="notice">
          {page === "jovem-aprendiz"
            ? "Aprendizagem é uma modalidade com formação e contrato próprios, em regra a partir dos 14 anos."
            : page === "estagios"
              ? "Estágio exige vínculo educacional e formalização conforme a legislação."
              : "Trabalho em geral é permitido a partir dos 16 anos, com restrições para menores de 18."}{" "}
          Confira os critérios da instituição.{" "}
          <Link href="/seguranca" className="text-link">
            Leia a orientação de segurança.
          </Link>
        </p>
      </div>
    );
  if (authTitles[page]) {
    if (page === "redefinir-senha") await requireUser();
    return (
      <div className="auth-shell">
        <Heading eyebrow="Sua história começa aqui" title={authTitles[page]} />
        <Notice params={query} />
        {!configured() && (
          <p className="notice">
            Contas ainda indisponíveis: o responsável precisa conectar o
            Supabase. Nenhum formulário simula cadastro ou login.
          </p>
        )}
        {page === "verificar-email" ? (
          <div className="panel">
            <p>
              Se o cadastro for elegível, use o link enviado para confirmar sua
              conta. Confira também a pasta de spam. O link só funciona após
              configurar o provedor de e-mail.
            </p>
            <Link className="text-link" href="/entrar">
              Voltar para entrar
            </Link>
          </div>
        ) : (
          <div className="panel">
            <form
              className="form-stack"
              action={
                page === "entrar"
                  ? signIn
                  : page === "cadastro"
                    ? signUp
                    : page === "recuperar-senha"
                      ? recover
                      : changePassword
              }
            >
              {page === "cadastro" && (
                <>
                  <Field
                    label="Como podemos chamar você?"
                    name="display_name"
                    maxLength={100}
                  />
                  <Field
                    label="Município em Sergipe"
                    name="city"
                    maxLength={80}
                  />
                </>
              )}
              {page !== "redefinir-senha" && (
                <label className="field">
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </label>
              )}
              {page !== "recuperar-senha" && (
                <label className="field">
                  {page === "entrar"
                    ? "Senha"
                    : "Senha (mínimo de 12 caracteres)"}
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={page === "entrar" ? 1 : 12}
                    maxLength={128}
                    autoComplete={
                      page === "entrar" ? "current-password" : "new-password"
                    }
                  />
                </label>
              )}
              {page === "cadastro" && (
                <>
                  <p className="small muted">
                    Não precisamos de CPF, RG, currículo nem endereço exato.
                    Contas de candidato e de empresa começam sem privilégios
                    administrativos.
                  </p>
                  <label className="checkbox">
                    <input name="terms" type="checkbox" required />
                    <span>
                      Li os{" "}
                      <Link className="text-link" href="/termos">
                        termos
                      </Link>{" "}
                      e o{" "}
                      <Link className="text-link" href="/privacidade">
                        aviso de privacidade
                      </Link>
                      . Não estou autorizando marketing.
                    </span>
                  </label>
                </>
              )}
              <Submit className="button" disabled={!configured()}>
                {page === "entrar"
                  ? "Entrar"
                  : page === "cadastro"
                    ? "Criar minha conta"
                    : page === "recuperar-senha"
                      ? "Enviar instruções"
                      : "Salvar nova senha"}
              </Submit>
            </form>
            <div className="auth-links">
              <Link href={page === "cadastro" ? "/entrar" : "/cadastro"}>
                {page === "cadastro" ? "Já tenho uma conta" : "Criar uma conta"}
              </Link>
              <Link href="/recuperar-senha">Esqueci minha senha</Link>
            </div>
          </div>
        )}
      </div>
    );
  }
  const c = content[page];
  if (!c) notFound();
  return (
    <div className="content-shell prose">
      <Heading
        eyebrow="Network Jobs · Orientação e transparência"
        title={c.title}
      >
        <p>{c.intro}</p>
      </Heading>
      {c.sections.map(([title, text]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
      {["seguranca", "jovem-aprendiz", "estagios"].includes(page) && (
        <p>
          Referência para conferência:{" "}
          <a
            href="https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/aprendizagem-profissional"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ministério do Trabalho e Emprego
          </a>
          . Texto orientativo de 27/10/2026; revisão jurídica e conferência da
          legislação atual pendentes.
        </p>
      )}
      <Link className="button secondary" href="/oportunidades">
        Explorar oportunidades
      </Link>
    </div>
  );
}
