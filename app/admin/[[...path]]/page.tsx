import { Submit } from "@/components/submit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { Heading, Notice, Field, Select } from "@/components/ui";
import { OpportunityForm } from "@/components/opportunity-form";
import { CsvImport } from "@/components/csv-import";
import { review, saveSource } from "@/app/actions";
import type { Opportunity, Params } from "@/lib/db/catalog";
import { labels } from "@/lib/validation";
export const metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};
const tables: Record<string, string> = {
  oportunidades: "opportunities",
  fontes: "sources",
  empresas: "organizations",
  denuncias: "reports",
  usuarios: "profiles",
  auditoria: "audit_logs",
};
const nav = [
  ["", "Visão geral"],
  ["oportunidades", "Oportunidades"],
  ["fontes", "Fontes"],
  ["empresas", "Empresas"],
  ["denuncias", "Denúncias"],
  ["usuarios", "Usuários"],
  ["auditoria", "Auditoria"],
  ["importar", "Importar CSV"],
];
export default async function Admin({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Params>;
}) {
  const s = await requireUser("admin");
  const path = (await params).path || [];
  const page = path[0] || "";
  const query = await searchParams;
  if (
    path.length > 1 ||
    !(page in tables || page === "" || page === "importar")
  )
    notFound();
  const { data: sources, error: sourceError } = await s.client
    .from("sources")
    .select("id,name")
    .eq("status", "approved");
  if (sourceError) throw new Error("Fontes indisponíveis");
  return (
    <div className="content-shell">
      <Heading
        eyebrow="Revisão humana, decisões registradas"
        title="Cuidar de cada oportunidade."
      />
      <nav className="dashboard-nav" aria-label="Administração">
        {nav.map(([p, l]) => (
          <Link key={p} href={`/admin${p ? "/" + p : ""}`}>
            {l}
          </Link>
        ))}
        <Link href="/painel">Minha conta</Link>
      </nav>
      <Notice params={query} />
      {page === "" ? (
        <Metrics s={s} />
      ) : page === "importar" ? (
        <div className="panel">
          <h2 style={{ fontSize: 26 }}>Importação autorizada</h2>
          <p>
            Consulte o formato em <code>docs/CSV.md</code>. Todos os itens
            entram pendentes. Cadastre e aprove a fonte antes da revisão de
            publicação.
          </p>
          <CsvImport />
        </div>
      ) : (
        <>
          {page === "fontes" && (
            <details className="panel">
              <summary>Cadastrar fonte e evidência de permissão</summary>
              <form action={saveSource} className="form-stack">
                <Field name="name" label="Nome da fonte" />
                <Field name="url" label="URL HTTPS oficial" type="url" />
                <label className="field">
                  Evidência de licença, autorização ou curadoria com referência
                  verificável
                  <textarea
                    name="permission_reference"
                    required
                    minLength={20}
                    maxLength={2000}
                  />
                </label>
                <Submit className="button">Cadastrar fonte pendente</Submit>
              </form>
            </details>
          )}
          {page === "oportunidades" && (
            <details className="panel">
              <summary>Cadastrar oportunidade por curadoria</summary>
              <OpportunityForm admin sources={sources || []} />
            </details>
          )}
          <Records
            s={s}
            table={tables[page]}
            page={query.page}
            sources={sources || []}
          />
        </>
      )}
    </div>
  );
}
type Session = Awaited<ReturnType<typeof requireUser>>;
async function Metrics({ s }: { s: Session }) {
  const definitions = [
    [
      "Oportunidades pendentes",
      "opportunities",
      "moderation_status",
      "pending",
    ],
    [
      "Oportunidades aprovadas (inclui vencidas)",
      "opportunities",
      "moderation_status",
      "approved",
    ],
    ["Empresas pendentes", "organizations", "status", "pending"],
    ["Denúncias abertas", "reports", "status", "pending"],
    ["Fontes aprovadas", "sources", "status", "approved"],
  ];
  const values = await Promise.all(
    definitions.map(async ([label, table, column, status]) => {
      const { count, error } = await s.client
        .from(table)
        .select("*", { head: true, count: "exact" })
        .eq(column, status);
      return { label, count, error };
    }),
  );
  const { count: active, error: activeError } = await s.client
    .from("opportunities")
    .select("*", { head: true, count: "exact" })
    .eq("moderation_status", "approved")
    .gt(
      "verified_at",
      new Date(new Date().getTime() - 30 * 86400000).toISOString(),
    )
    .or(`closing_at.is.null,closing_at.gt.${new Date().toISOString()}`);
  const { count: expired, error: expiredError } = await s.client
    .from("opportunities")
    .select("*", { head: true, count: "exact" })
    .eq("moderation_status", "approved")
    .lte("closing_at", new Date().toISOString());
  return (
    <>
      <div className="metric-grid">
        {[
          ...values,
          {
            label: "Aprovadas dentro do prazo e da revisão¹",
            count: active,
            error: activeError,
          },
          {
            label: "Aprovadas com prazo vencido",
            count: expired,
            error: expiredError,
          },
        ].map((v) => (
          <div key={v.label} className="panel">
            <strong>{v.error ? "Indisponível" : (v.count ?? 0)}</strong>
            <span>{v.label}</span>
          </div>
        ))}
      </div>
      <p className="small muted">
        ¹ A visibilidade pública também exige fonte ou organização ativa.
        Anúncios sem nova verificação em 30 dias saem automaticamente do
        catálogo. Não há monitoramento automático de links.
      </p>
      <div className="notice">
        Antes de publicar: confirme origem e permissão, validade, instituição,
        requisitos legais, segurança de adolescentes e ausência de cobrança. As
        páginas legais são minutas e o contato do responsável ainda precisa ser
        definido.
      </div>
    </>
  );
}
async function Records({
  s,
  table,
  page,
  sources,
}: {
  s: Session;
  table: string;
  page?: string;
  sources: { id: string; name: string }[];
}) {
  const index = Math.max(1, Math.min(10000, Number(page) || 1));
  const { data, error, count } = await s.client
    .from(table)
    .select(
      table === "profiles" ? "id,display_name,role,city,created_at" : "*",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((index - 1) * 20, index * 20 - 1);
  if (error)
    return (
      <p className="notice error" role="alert">
        Falha ao consultar registros. Confira migrações e permissões.
      </p>
    );
  return (
    <>
      <p className="muted">
        {count || 0} registros · página {index}
      </p>
      {data?.map((record) => {
        const row = record as unknown as Record<string, unknown>;
        return (
          <article className="record" key={String(row.id)}>
            <h2 style={{ fontSize: 22 }}>
              {String(
                row.title ||
                  row.name ||
                  row.display_name ||
                  row.entity ||
                  "Denúncia",
              )}
            </h2>
            <p className="small">
              {String(row.id)} ·{" "}
              {labels[
                String(row.moderation_status || row.status || row.role)
              ] || String(row.role || row.entity || "")}
            </p>
            <details>
              <summary>Inspecionar registro</summary>
              <pre>
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(row).filter(
                      ([key]) => key !== "search_document",
                    ),
                  ),
                  null,
                  2,
                )}
              </pre>
            </details>
            {table === "opportunities" && (
              <details>
                <summary>Editar dados e reenviar à revisão</summary>
                <OpportunityForm
                  item={row as unknown as Opportunity}
                  admin
                  sources={sources}
                />
              </details>
            )}
            {!["profiles", "audit_logs"].includes(table) && (
              <form action={review} className="form-stack">
                <input name="table" type="hidden" value={table} />
                <input name="id" type="hidden" value={String(row.id)} />
                <div className="form-grid">
                  <Select
                    label="Decisão"
                    name="status"
                    options={
                      table === "reports"
                        ? [["resolved", "Revisada / resolvida"]]
                        : [
                            ["approved", "Aprovar ou renovar verificação"],
                            ["rejected", "Recusar"],
                            ["suspended", "Suspender"],
                          ]
                    }
                  />
                  <Field
                    label="Motivo / evidência (mínimo de 20 caracteres)"
                    name="reason"
                  />
                </div>
                <label className="checkbox">
                  <input type="checkbox" name="checked" />
                  <span>
                    Conferi legitimidade, fonte e permissão, prazo,
                    elegibilidade, proteção de adolescentes e ausência de
                    cobranças. Obrigatório para aprovar.
                  </span>
                </label>
                <Submit className="button">Registrar decisão</Submit>
              </form>
            )}
          </article>
        );
      })}
      {!data?.length && <p className="notice">Nenhum registro nesta página.</p>}
      <nav aria-label="Paginação administrativa" className="pagination">
        {index > 1 && (
          <Link className="button secondary" href={`?page=${index - 1}`}>
            Anterior
          </Link>
        )}
        {(count || 0) > index * 20 && (
          <Link className="button secondary" href={`?page=${index + 1}`}>
            Próxima
          </Link>
        )}
      </nav>
    </>
  );
}
