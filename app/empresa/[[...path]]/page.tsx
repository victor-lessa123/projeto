import { Submit } from "@/components/submit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { Heading, Notice, Field } from "@/components/ui";
import { registerCompany, closeOpportunity } from "@/app/actions";
import { OpportunityForm } from "@/components/opportunity-form";
import type { Opportunity, Params } from "@/lib/db/catalog";
import { labels } from "@/lib/validation";
export const metadata = {
  title: "Área da empresa",
  robots: { index: false, follow: false },
};
export default async function Company({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Params>;
}) {
  const s = await requireUser();
  const path = (await params).path || [];
  if (path.length > 0 && !["perfil", "vagas"].includes(path[0])) notFound();
  const { data: org, error } = await s.client
    .from("organizations")
    .select("*")
    .eq("owner_id", s.user.id)
    .maybeSingle();
  if (error) throw new Error("Consulta indisponível");
  let item: Opportunity | undefined;
  if (path.length === 3 && path[0] === "vagas" && path[2] === "editar") {
    const { data } = await s.client
      .from("opportunities")
      .select("*")
      .eq("id", path[1])
      .eq("created_by", s.user.id)
      .maybeSingle();
    if (!data) notFound();
    item = data as Opportunity;
  }
  const isForm = path.join("/") === "vagas/nova" || Boolean(item);
  return (
    <div className="content-shell">
      <Heading
        eyebrow="Organizações que abrem caminhos"
        title={isForm ? "Conte sobre a oportunidade." : "Área da empresa."}
      />
      <nav aria-label="Empresa" className="dashboard-nav">
        <Link href="/empresa">Visão geral</Link>
        <Link href="/empresa/perfil">Verificação</Link>
        <Link href="/empresa/vagas">Minhas oportunidades</Link>
        <Link href="/empresa/vagas/nova">Nova oportunidade</Link>
        <Link href="/painel">Minha conta</Link>
      </nav>
      <Notice params={await searchParams} />
      {!org ? (
        <form action={registerCompany} className="panel form-stack">
          <h2 style={{ fontSize: 25 }}>Apresente sua organização.</h2>
          <p>
            O cadastro exige e-mail confirmado e revisão humana. Não permite
            publicação imediata. Não se apresente como uma instituição que você
            não representa.
          </p>
          <Field name="name" label="Nome da organização" maxLength={150} />
          <Field name="website" label="Site institucional HTTPS" type="url" />
          <Submit className="button">Cadastrar para verificação</Submit>
        </form>
      ) : (
        <>
          <p className="notice">
            <strong>{org.name}</strong> · {labels[org.status]}
            {org.verification_notes && <> — {org.verification_notes}</>}
          </p>
          {isForm ? (
            <OpportunityForm item={item} />
          ) : path[0] === "vagas" ? (
            <CompanyList s={s} />
          ) : (
            <div className="panel">
              <h2 style={{ fontSize: 25 }}>
                Publicar é uma responsabilidade compartilhada.
              </h2>
              <p>
                Você pode enviar oportunidades para revisão. Elas ficam privadas
                até a organização e o anúncio serem aprovados. Edições voltam
                para revisão e encerramento remove o anúncio da busca.
              </p>
              <p>
                Site informado:{" "}
                <a
                  className="text-link"
                  href={org.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {new URL(org.website).hostname}
                </a>
              </p>
              <Link className="button" href="/empresa/vagas/nova">
                Enviar uma oportunidade
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
async function CompanyList({
  s,
}: {
  s: Awaited<ReturnType<typeof requireUser>>;
}) {
  const { data, error } = await s.client
    .from("opportunities")
    .select("id,title,moderation_status,review_reason")
    .eq("created_by", s.user.id)
    .order("created_at", { ascending: false });
  if (error)
    return (
      <p role="alert" className="notice error">
        Não foi possível carregar os anúncios.
      </p>
    );
  return data?.length ? (
    <>
      {data.map((r) => (
        <div className="record" key={r.id}>
          <h2 style={{ fontSize: 24 }}>{r.title}</h2>
          <p>{labels[r.moderation_status]}</p>
          {r.review_reason && <p>{r.review_reason}</p>}
          <div className="button-row">
            <Link
              className="button secondary"
              href={`/empresa/vagas/${r.id}/editar`}
            >
              Editar e reenviar
            </Link>
            <form action={closeOpportunity}>
              <input type="hidden" name="id" value={r.id} />
              <Submit className="button secondary">Encerrar</Submit>
            </form>
          </div>
        </div>
      ))}
    </>
  ) : (
    <p className="notice">Você ainda não enviou oportunidades.</p>
  );
}
