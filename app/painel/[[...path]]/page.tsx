import { Submit } from "@/components/submit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { Heading, Notice, Field } from "@/components/ui";
import type { Params } from "@/lib/db/catalog";
import { date } from "@/lib/db/catalog";
import {
  saveProfile,
  signOut,
  toggleFavorite,
  deleteAccount,
  acceptPolicy,
} from "@/app/actions";
export const metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};
export default async function Dashboard({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Params>;
}) {
  const s = await requireUser();
  const path = (await params).path?.join("/") || "";
  if (
    ![
      "",
      "perfil",
      "favoritos",
      "preferencias",
      "privacidade",
      "denuncias",
    ].includes(path)
  )
    notFound();
  return (
    <div className="content-shell">
      <Heading
        eyebrow="Seu espaço privado"
        title={
          path === "favoritos"
            ? "Seus próximos caminhos."
            : path === "privacidade"
              ? "Você no controle dos seus dados."
              : path === "denuncias"
                ? "Suas denúncias."
                : path === "perfil"
                  ? "Seu perfil."
                  : `Olá, ${s.profile.display_name}.`
        }
      />
      <nav className="dashboard-nav" aria-label="Minha conta">
        {[
          ["", "Visão geral"],
          ["perfil", "Perfil"],
          ["favoritos", "Favoritos"],
          ["denuncias", "Denúncias"],
          ["privacidade", "Privacidade"],
        ].map(([p, l]) => (
          <Link key={p} href={`/painel${p ? "/" + p : ""}`}>
            {l}
          </Link>
        ))}
        <Link href="/empresa">Área da empresa</Link>
        {s.profile.role === "admin" && <Link href="/admin">Administração</Link>}
      </nav>
      <Notice params={await searchParams} />
      {path === "perfil" ? (
        <form action={saveProfile} className="panel form-stack">
          <Field
            name="display_name"
            label="Nome de exibição"
            defaultValue={s.profile.display_name}
            maxLength={100}
          />
          <Field
            name="city"
            label="Município"
            defaultValue={s.profile.city}
            maxLength={80}
          />
          <p className="small muted">
            Seu perfil não é público. E-mail de acesso: {s.user.email}
          </p>
          <Submit className="button">Salvar perfil</Submit>
        </form>
      ) : path === "favoritos" ? (
        <Favorites s={s} />
      ) : path === "denuncias" ? (
        <Reports s={s} />
      ) : path === "privacidade" ? (
        <>
          <div className="panel">
            <h2 style={{ fontSize: 24 }}>Dados mínimos, escolhas claras.</h2>
            <p>
              Nome, e-mail, município e dados de uso dos recursos privados são
              tratados para operar sua conta. Não coletamos CPF, RG nem
              currículo.
            </p>
            <Link className="text-link" href="/privacidade">
              Ler aviso completo e seus limites
            </Link>
            <form action={acceptPolicy} style={{ marginTop: 20 }}>
              <Submit className="button secondary">
                Registrar ciência da política atual
              </Submit>
            </form>
            <p className="small muted">
              Esse registro não autoriza marketing. Não há alertas promocionais
              no MVP.
            </p>
          </div>
          <form action={deleteAccount} className="panel form-stack">
            <h2 style={{ fontSize: 24 }}>Excluir conta e dados vinculados</h2>
            <p>
              A ação remove sua conta, favoritos e denúncias. Se você possui uma
              organização, ela e seus anúncios também serão excluídos. A
              auditoria de moderação perde o vínculo com seu perfil. A ação não
              pode ser desfeita por este painel.
            </p>
            <Field label="Digite EXCLUIR para confirmar" name="confirmation" />
            <Submit className="button danger">Excluir minha conta</Submit>
          </form>
        </>
      ) : path === "preferencias" ? (
        <p className="notice">
          Alertas, pesquisas salvas e preferências de recomendação são previstos
          para a fase 2. Nenhum envio por e-mail está ativado.
        </p>
      ) : (
        <>
          <div className="panel">
            <h2 style={{ fontSize: 26 }}>Um passo de cada vez.</h2>
            <p>
              Explore o catálogo, confira a origem dos anúncios e salve o que
              fizer sentido para você.
            </p>
            <Link className="button" href="/oportunidades">
              Buscar oportunidades
            </Link>
          </div>
          <p className="notice">
            Não enviamos candidaturas automaticamente. A inscrição acontece na
            fonte externa.
          </p>
        </>
      )}
      <form action={signOut}>
        <Submit className="button secondary">Sair da conta</Submit>
      </form>
    </div>
  );
}
type Session = Awaited<ReturnType<typeof requireUser>>;
async function Favorites({ s }: { s: Session }) {
  const { data, error } = await s.client
    .from("favorites")
    .select("opportunity_id,opportunities(id,title,slug,kind)")
    .eq("user_id", s.user.id);
  if (error)
    return (
      <p role="alert" className="notice error">
        Não foi possível carregar os favoritos.
      </p>
    );
  return data?.length ? (
    <>
      {data.map((row) => {
        const item = row.opportunities as unknown as {
          title: string;
          slug: string;
          kind: string;
        } | null;
        return (
          <div key={row.opportunity_id} className="record flex-between">
            <div>
              {item ? (
                <Link
                  className="text-link"
                  href={`/${item.kind === "curso" ? "cursos" : "oportunidades"}/${item.slug}`}
                >
                  {item.title}
                </Link>
              ) : (
                <span>Oportunidade retirada ou indisponível.</span>
              )}
            </div>
            <form action={toggleFavorite}>
              <input type="hidden" name="id" value={row.opportunity_id} />
              <Submit className="button secondary">Remover</Submit>
            </form>
          </div>
        );
      })}
    </>
  ) : (
    <p className="notice">Você ainda não salvou oportunidades.</p>
  );
}
async function Reports({ s }: { s: Session }) {
  const { data, error } = await s.client
    .from("reports")
    .select("id,reason,status,resolution,created_at")
    .eq("user_id", s.user.id)
    .order("created_at", { ascending: false });
  if (error)
    return (
      <p role="alert" className="notice error">
        Não foi possível carregar as denúncias.
      </p>
    );
  return data?.length ? (
    <>
      {data.map((r) => (
        <div key={r.id} className="record">
          <p className="small">
            Protocolo {r.id} · {date(r.created_at)}
          </p>
          <p>{r.reason}</p>
          <p>
            <strong>
              {r.status === "resolved" ? "Revisada" : "Aguardando revisão"}
            </strong>
          </p>
          {r.resolution && <p>{r.resolution}</p>}
        </div>
      ))}
    </>
  ) : (
    <p className="notice">Você ainda não registrou denúncias.</p>
  );
}
