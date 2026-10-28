import "server-only";
import { redirect } from "next/navigation";
import { db, configured } from "@/lib/db/server";
export async function session() {
  if (!configured()) return null;
  const client = await db();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await client
    .from("profiles")
    .select("id,display_name,city,role")
    .eq("id", user.id)
    .single();
  return { client, user, profile };
}
export async function requireUser(role?: "admin" | "company") {
  const s = await session();
  if (!s) redirect("/entrar?erro=Entre para continuar.");
  if (!s.profile || (role && s.profile.role !== role))
    redirect("/painel?erro=Acesso não autorizado.");
  return { ...s, profile: s.profile };
}
