import { Submit } from "@/components/submit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Heart, Flag } from "lucide-react";
import { opportunity, date } from "@/lib/db/catalog";
import { session } from "@/lib/auth/session";
import { labels } from "@/lib/validation";
import { isSafeExternalUrl } from "@/lib/security/urls";
import { report, toggleFavorite } from "@/app/actions";
export async function Detail({
  slug,
  course = false,
}: {
  slug: string;
  course?: boolean;
}) {
  const item = await opportunity(slug);
  if (
    !item ||
    (item.kind === "curso") !== course ||
    (item.closing_at && new Date(item.closing_at) <= new Date()) ||
    !item.verified_at ||
    Date.parse(item.verified_at) < new Date().getTime() - 30 * 86400000
  )
    notFound();
  const s = await session();
  let favorite = false;
  if (s) {
    const { data } = await s.client
      .from("favorites")
      .select("opportunity_id")
      .eq("user_id", s.user.id)
      .eq("opportunity_id", item.id)
      .maybeSingle();
    favorite = Boolean(data);
  }
  return (
    <div className="content-shell">
      <Link className="text-link" href={course ? "/cursos" : "/oportunidades"}>
        ← Voltar ao catálogo
      </Link>
      <div className="page-heading" style={{ marginTop: 26 }}>
        <span className="tag">{labels[item.kind]}</span>
        <h1 style={{ marginTop: 18 }}>{item.title}</h1>
        <p className="muted">
          {item.source_name} · {item.city}, {item.state} ·{" "}
          {labels[item.modality]}
        </p>
      </div>
      <div className="detail-grid">
        <article className="prose">
          <h2>Sobre {course ? "o curso" : "a oportunidade"}</h2>
          <p className="prewrap">{item.description}</p>
          <h2>Requisitos</h2>
          <p className="prewrap">{item.requirements}</p>
          <p>
            Confira os critérios da instituição. Informações insuficientes não
            determinam sua elegibilidade.
          </p>
          <dl className="detail-facts">
            {[
              ["Remuneração", item.salary || "Não informado"],
              ["Escolaridade", item.education || "Não informado"],
              [
                "Experiência",
                item.experience === "nao"
                  ? "Não exigida"
                  : item.experience === "sim"
                    ? "Exigida"
                    : "Não informado",
              ],
              [
                "Faixa etária",
                item.min_age || item.max_age
                  ? `${item.min_age ?? "Não informada"} a ${item.max_age ?? "Não informada"} anos`
                  : "Não informada",
              ],
              [
                "Carga horária",
                item.hours
                  ? `${item.hours} horas (confira a unidade na fonte)`
                  : "Não informada",
              ],
              [
                "Prazo",
                item.closing_at ? date(item.closing_at) : "Prazo não informado",
              ],
              ["Publicação", date(item.published_at)],
              ["Última verificação", date(item.last_checked_at)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {item.age_justification && (
            <p className="small">
              Justificativa declarada da faixa etária: {item.age_justification}
            </p>
          )}
          <h2>Viu algo suspeito?</h2>
          {s ? (
            <form action={report} className="form-stack">
              <input type="hidden" name="opportunity_id" value={item.id} />
              <label className="field">
                Conte o que precisa ser revisado
                <textarea
                  name="reason"
                  required
                  minLength={15}
                  maxLength={2000}
                  placeholder="Não inclua documentos nem dados sensíveis."
                />
              </label>
              <Submit className="button secondary">
                <Flag size={17} />
                Enviar denúncia
              </Submit>
            </form>
          ) : (
            <p>
              <Link className="text-link" href="/entrar">
                Entre para registrar e acompanhar uma denúncia.
              </Link>
            </p>
          )}
        </article>
        <aside>
          <div className="panel">
            <h2 style={{ fontSize: 24 }}>O próximo passo é seu.</h2>
            <p className="small">
              Você será direcionado ao site da organização responsável. Sua
              inscrição não será enviada pelo Network Jobs.
            </p>
            {isSafeExternalUrl(item.original_url) && (
              <a
                className="button"
                target="_blank"
                rel="noopener noreferrer"
                href={item.original_url}
              >
                Acessar inscrição externa <ExternalLink size={16} />
              </a>
            )}
            <hr
              style={{
                border: "0",
                borderTop: "1px solid var(--line)",
                margin: "24px 0",
              }}
            />
            <p className="small">
              <strong>Origem:</strong> {item.source_name}
            </p>
            {isSafeExternalUrl(item.source_url) && (
              <a
                className="text-link"
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar fonte declarada <ExternalLink size={14} />
              </a>
            )}
            <p className="small muted" style={{ marginTop: 16 }}>
              Verificação editorial em {date(item.verified_at)}. Confirme a
              disponibilidade no site externo, especialmente quando não houver
              prazo.
            </p>
            {s ? (
              <form action={toggleFavorite}>
                <input type="hidden" name="id" value={item.id} />
                <Submit className="button secondary">
                  <Heart size={17} />
                  {favorite ? "Remover favorito" : "Salvar oportunidade"}
                </Submit>
              </form>
            ) : (
              <Link className="text-link" href="/entrar">
                Entre para salvar nos favoritos
              </Link>
            )}
          </div>
          <p className="notice">
            Nunca pague para participar de uma seleção.{" "}
            <Link className="text-link" href="/seguranca">
              Saiba se proteger.
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
