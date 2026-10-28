import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
const sql = readFileSync(
  new URL(
    "../supabase/migrations/202610270001_network_jobs.sql",
    import.meta.url,
  ),
  "utf8",
);
const ids = {
  candidate: "11111111-1111-4111-8111-111111111111",
  other: "22222222-2222-4222-8222-222222222222",
  company: "33333333-3333-4333-8333-333333333333",
  company2: "44444444-4444-4444-8444-444444444444",
  admin: "55555555-5555-4555-8555-555555555555",
};
let pg: PGlite;
let org: string;
let opp: string;
async function as(who: keyof typeof ids | "anon") {
  await pg.exec("reset role");
  await pg.query("select set_config('request.jwt.claim.sub',$1,false)", [
    who === "anon" ? "" : ids[who],
  ]);
  await pg.exec(`set role ${who === "anon" ? "anon" : "authenticated"}`);
}
async function scalar(query: string) {
  return (await pg.query<Record<string, unknown>>(query)).rows[0];
}
beforeAll(async () => {
  pg = new PGlite({ extensions: { unaccent, pgcrypto } });
  await pg.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}',email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
  );
  await pg.exec(sql);
  for (const [name, id] of Object.entries(ids))
    await pg.query(
      "insert into auth.users(id,raw_user_meta_data,email_confirmed_at) values($1,$2,now())",
      [
        id,
        JSON.stringify({ display_name: name, city: "Aracaju", role: "admin" }),
      ],
    );
  await pg.query("update public.profiles set role='admin' where id=$1", [
    ids.admin,
  ]);
  await as("company");
  await pg.query("select public.register_organization($1,$2)", [
    "Organização sintética A",
    "https://org-a.com/",
  ]);
  org = String((await scalar("select id from organizations"))!.id);
  await as("company2");
  await pg.query("select public.register_organization($1,$2)", [
    "Organização sintética B",
    "https://org-b.com/",
  ]);
  await as("company");
  const inserted = await pg.query<{ id: string }>(
    `insert into opportunities(title,description,kind,area,city,modality,requirements,source_name,source_url,original_url,organization_id,moderation_status,safety_review) values('Aprendiz sintético','Descrição longa exclusivamente de teste. Nunca deve entrar no catálogo real.','aprendiz','Tecnologia','Aracaju','presencial','Requisitos de teste para aprendizagem','Organização A','https://org-a.com/','https://org-a.com/vaga',$1,'approved',true) returning id`,
    [org],
  );
  opp = inserted.rows[0].id;
});
afterAll(async () => {
  await pg?.close();
});
describe("PostgreSQL migration and RLS", () => {
  it("ignores the signup role metadata and defaults to candidate", async () => {
    await as("candidate");
    expect((await scalar("select role from profiles"))?.role).toBe("candidate");
  });
  it("prevents public role escalation and private profile access", async () => {
    await as("candidate");
    await expect(pg.exec("update profiles set role='admin'")).rejects.toThrow();
    expect((await pg.exec("select * from profiles"))[0].rows).toHaveLength(1);
  });
  it("keeps unverified company submissions pending despite forged approval", async () => {
    await as("company");
    expect(
      await scalar("select moderation_status,safety_review from opportunities"),
    ).toMatchObject({ moderation_status: "pending", safety_review: false });
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
  });
  it("prevents candidate publishing and crossing company ownership", async () => {
    await as("candidate");
    await expect(
      pg.query("update organizations set status='approved' where id=$1", [org]),
    ).resolves.toMatchObject({ affectedRows: 0 });
    await as("company2");
    expect(
      (
        await pg.query(
          "update opportunities set title=$1 where id=$2 returning id",
          ["Tentativa cruzada", opp],
        )
      ).rows,
    ).toHaveLength(0);
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
  });
  it("requires approved provenance and safety review before publishing", async () => {
    await as("admin");
    await expect(
      pg.query(
        "update opportunities set moderation_status='approved',safety_review=true,review_reason='Conferência de teste documentada' where id=$1",
        [opp],
      ),
    ).rejects.toThrow("Proveniência");
    await pg.query(
      "update organizations set status='approved',verification_notes='Legitimidade revisada em teste' where id=$1",
      [org],
    );
    await expect(
      pg.query(
        "update opportunities set moderation_status='approved' where id=$1",
        [opp],
      ),
    ).rejects.toThrow("Revisão de segurança");
    await pg.query(
      "update opportunities set moderation_status='approved',safety_review=true,review_reason='Conferência de teste documentada' where id=$1",
      [opp],
    );
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      1,
    );
  });
  it("supports accent-insensitive textual search", async () => {
    await as("anon");
    expect(
      (
        await pg.exec(
          "select id from opportunities where search_document @@ websearch_to_tsquery('public.portuguese_unaccent','TECNOLOGÍA')",
        )
      )[0].rows,
    ).toHaveLength(1);
  });
  it("isolates favorites and reports between users and blocks anonymous writes", async () => {
    await as("candidate");
    await pg.query("insert into favorites values($1,$2,now())", [
      ids.candidate,
      opp,
    ]);
    await pg.query("insert into reports(opportunity_id,reason) values($1,$2)", [
      opp,
      "Relato sintético de teste para moderação.",
    ]);
    await as("other");
    expect((await pg.exec("select * from favorites"))[0].rows).toHaveLength(0);
    expect((await pg.exec("select * from reports"))[0].rows).toHaveLength(0);
    await expect(
      pg.query("insert into favorites values($1,$2,now())", [
        ids.candidate,
        opp,
      ]),
    ).rejects.toThrow();
    await as("anon");
    await expect(pg.exec("select * from profiles")).rejects.toThrow();
    await expect(
      pg.query("insert into reports(opportunity_id,reason) values($1,$2)", [
        opp,
        "Anônimo não deve inserir dados.",
      ]),
    ).rejects.toThrow();
  });
  it("enforces report quotas in the database", async () => {
    await as("candidate");
    for (let i = 0; i < 4; i++)
      await pg.query(
        "insert into reports(opportunity_id,reason) values($1,$2)",
        [opp, "Outra denúncia sintética de teste."],
      );
    await expect(
      pg.query("insert into reports(opportunity_id,reason) values($1,$2)", [
        opp,
        "Denúncia excedente de teste.",
      ]),
    ).rejects.toThrow("Limite");
  });
  it("withdraws approved listings when an organization is suspended", async () => {
    await as("admin");
    await pg.query("update organizations set status='suspended' where id=$1", [
      org,
    ]);
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
    await as("admin");
    await pg.query("update organizations set status='approved' where id=$1", [
      org,
    ]);
  });
  it("hides expired and stale opportunities from anonymous users", async () => {
    await pg.exec(
      "reset role; alter table opportunities disable trigger validate_opportunity",
    );
    await pg.query(
      "update opportunities set closing_at=now()-interval '1 day' where id=$1",
      [opp],
    );
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
    await pg.exec("reset role");
    await pg.query(
      "update opportunities set closing_at=null,verified_at=now()-interval '31 days' where id=$1",
      [opp],
    );
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
    await pg.exec("reset role");
    await pg.query("update opportunities set verified_at=now() where id=$1", [
      opp,
    ]);
    await pg.exec(
      "alter table opportunities enable trigger validate_opportunity",
    );
  });
  it("suspending a source withdraws its listings even when its organization remains approved", async () => {
    await as("admin");
    const src = (
      await pg.query<{ id: string }>(
        "insert into sources(name,url,permission_reference,status) values('Fonte de teste','https://fonte.org/','Evidência exclusivamente sintética de permissão','approved') returning id",
      )
    ).rows[0].id;
    await pg.query("update opportunities set source_id=$1 where id=$2", [
      src,
      opp,
    ]);
    await pg.query("update sources set status='suspended' where id=$1", [src]);
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
    await as("admin");
    await pg.query("update opportunities set source_id=null where id=$1", [
      opp,
    ]);
  });
  it("rejects canonical URL duplicates and leaves the original record intact", async () => {
    await as("admin");
    await expect(
      pg.exec(
        "insert into opportunities(title,description,kind,area,city,modality,requirements,source_name,source_url,original_url) select title,description,kind,area,city,modality,requirements,source_name,source_url,original_url from opportunities limit 1",
      ),
    ).rejects.toThrow("unique");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      1,
    );
  });
  it("requires email confirmation to register organizations", async () => {
    await pg.exec("reset role");
    await pg.query(
      "update auth.users set email_confirmed_at=null where id=$1",
      [ids.other],
    );
    await as("other");
    await expect(
      pg.query("select public.register_organization($1,$2)", [
        "Sem confirmação",
        "https://not-confirmed.org/",
      ]),
    ).rejects.toThrow("Confirme");
  });
  it("protects source permission evidence and audit logs", async () => {
    await as("candidate");
    expect((await pg.exec("select * from sources"))[0].rows).toHaveLength(0);
    expect((await pg.exec("select * from audit_logs"))[0].rows).toHaveLength(0);
    await expect(
      pg.exec("select public.enforce_quota('report',1000)"),
    ).rejects.toThrow("permission");
  });
  it("resets publication on company editing and preserves audit history", async () => {
    await as("company");
    await pg.query("update opportunities set title=$1 where id=$2", [
      "Aprendiz sintético alterado",
      opp,
    ]);
    expect(
      await scalar("select moderation_status,verified_at from opportunities"),
    ).toMatchObject({ moderation_status: "pending", verified_at: null });
    await as("anon");
    expect((await pg.exec("select * from opportunities"))[0].rows).toHaveLength(
      0,
    );
    await as("admin");
    expect(
      Number(
        (
          await scalar(
            "select count(*) n from audit_logs where entity='opportunities'",
          )
        )?.n,
      ),
    ).toBeGreaterThanOrEqual(3);
  });
  it("rejects duplicates and unlawful ages in the database", async () => {
    await as("admin");
    await expect(
      pg.query("update opportunities set min_age=13 where id=$1", [opp]),
    ).rejects.toThrow();
    await expect(
      pg.query("update opportunities set original_url=$1 where id=$2", [
        "https://bit.ly/hidden",
        opp,
      ]),
    ).rejects.toThrow();
  });
  it("deletes the user and related personal data through the restricted RPC", async () => {
    await as("candidate");
    await pg.exec("select public.delete_own_account()");
    await pg.exec("reset role");
    expect(
      (await pg.query("select * from profiles where id=$1", [ids.candidate]))
        .rows,
    ).toHaveLength(0);
    expect((await pg.exec("select * from favorites"))[0].rows).toHaveLength(0);
    expect((await pg.exec("select * from reports"))[0].rows).toHaveLength(0);
  });
});
