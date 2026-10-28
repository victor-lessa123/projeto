import type { MetadataRoute } from "next";
import { configured, db } from "@/lib/db/server";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return [];
  const paths = [
    "",
    "/oportunidades",
    "/cursos",
    "/jovem-aprendiz",
    "/estagios",
    "/primeiro-emprego",
    "/como-funciona",
    "/sobre",
    "/seguranca",
    "/guia-curriculo",
    "/guia-entrevista",
    "/guia-estudar",
  ];
  const entries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${site}${path}`,
  }));
  if (configured()) {
    const client = await db();
    const { data } = await client
      .from("public_catalog")
      .select("slug,kind,updated_at")
      .eq("moderation_status", "approved")
      .limit(1000);
    for (const i of data || [])
      entries.push({
        url: `${site}/${i.kind === "curso" ? "cursos" : "oportunidades"}/${i.slug}`,
        lastModified: i.updated_at,
      });
  }
  return entries;
}
