import "server-only";
import { db, configured } from "@/lib/db/server";
export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: string;
  area: string;
  city: string;
  state: string;
  modality: string;
  education: string;
  experience: string;
  salary: string;
  min_age: number | null;
  max_age: number | null;
  age_justification: string;
  hours: number | null;
  requirements: string;
  free: boolean;
  original_url: string;
  source_name: string;
  source_url: string;
  source_id: string | null;
  organization_id: string | null;
  verified_at: string | null;
  published_at: string | null;
  closing_at: string | null;
  last_checked_at: string | null;
  moderation_status: string;
  created_by: string;
  review_reason: string | null;
};
export type Params = Record<string, string | undefined>;
export async function catalog(params: Params = {}, course = false) {
  if (!configured())
    return {
      items: [] as Opportunity[],
      count: 0,
      state: "unconfigured" as const,
    };
  try {
    const client = await db();
    let query = (
      params.q
        ? client
            .rpc(
              "search_opportunities",
              {
                search_query: params.q.slice(0, 120),
              },
              { count: "exact" },
            )
            .select("*")
        : client.from("public_catalog").select("*", { count: "exact" })
    )
      .eq("moderation_status", "approved")
      .not("verified_at", "is", null)
      .or(`closing_at.is.null,closing_at.gt.${new Date().toISOString()}`);
    if (course) query = query.eq("kind", "curso");
    else query = query.neq("kind", "curso");
    for (const key of ["city", "kind", "modality", "experience", "area"])
      if (params[key]) query = query.eq(key, params[key]!.slice(0, 100));
    if (params.education)
      query = query.ilike(
        "education",
        `%${params.education.replace(/[%_]/g, "").slice(0, 100)}%`,
      );
    if (params.age && /^\d{1,2}$/.test(params.age)) {
      const age = Number(params.age);
      query = query
        .or(`min_age.is.null,min_age.lte.${age}`)
        .or(`max_age.is.null,max_age.gte.${age}`);
    }
    if (params.since && /^\d{4}-\d{2}-\d{2}$/.test(params.since))
      query = query.gte("published_at", params.since);
    const page = Math.max(1, Math.min(10000, Number(params.page) || 1));
    if (!params.q) query = query.order("published_at", { ascending: false });
    const { data, count, error } = await query.range(
      (page - 1) * 12,
      page * 12 - 1,
    );
    if (error)
      return { items: [] as Opportunity[], count: 0, state: "error" as const };
    return {
      items: (data || []) as Opportunity[],
      count: count || 0,
      state: "ready" as const,
    };
  } catch {
    return { items: [] as Opportunity[], count: 0, state: "error" as const };
  }
}
export async function opportunity(slug: string) {
  if (!configured()) return null;
  const client = await db();
  const { data, error } = await client
    .from("public_catalog")
    .select("*")
    .eq("slug", slug)
    .eq("moderation_status", "approved")
    .maybeSingle();
  if (error) throw new Error("Não foi possível consultar a oportunidade.");
  return data as Opportunity | null;
}
export const date = (v: string | null) =>
  v
    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }).format(new Date(v))
    : "Não informado";
