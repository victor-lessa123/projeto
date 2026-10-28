"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, configured } from "@/lib/db/server";
import { requireUser } from "@/lib/auth/session";
import { externalUrl, opportunitySchema, reportSchema } from "@/lib/validation";
import { canonicalUrl } from "@/lib/security/urls";
import { previewCsv } from "@/lib/sources";
const val = (f: FormData, k: string) => String(f.get(k) || "");
function back(path: string, message: string, error = false): never {
  redirect(
    `${path}?${error ? "erro" : "mensagem"}=${encodeURIComponent(message)}`,
  );
}
async function authClient() {
  if (!configured())
    back(
      "/entrar",
      "Conecte o Supabase para usar contas. Nenhum dado foi salvo.",
      true,
    );
  return db();
}
function origin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" ||
      (process.env.NODE_ENV !== "production" && u.hostname === "localhost")
      ? u.origin
      : null;
  } catch {
    return null;
  }
}
export async function signUp(f: FormData) {
  const input = z
    .object({
      email: z.email().max(254),
      password: z.string().min(12).max(128),
      display_name: z.string().trim().min(2).max(100),
      city: z.string().trim().min(2).max(80),
      terms: z.literal("on"),
    })
    .safeParse(Object.fromEntries(f));
  if (!input.success)
    back(
      "/cadastro",
      "Revise os dados, aceite os termos e use uma senha de pelo menos 12 caracteres.",
      true,
    );
  const client = await authClient();
  const url = origin();
  if (!url)
    back(
      "/cadastro",
      "Configure a URL oficial do site antes de cadastrar contas.",
      true,
    );
  const { error } = await client.auth.signUp({
    email: input.data.email,
    password: input.data.password,
    options: {
      data: {
        display_name: input.data.display_name,
        city: input.data.city,
        policy_version: "2026-10-draft",
      },
      emailRedirectTo: `${url}/auth/callback`,
    },
  });
  if (error)
    back(
      "/cadastro",
      "Não foi possível cadastrar agora. Verifique os dados ou tente novamente mais tarde.",
      true,
    );
  back(
    "/verificar-email",
    "Se o endereço puder ser cadastrado, você receberá instruções por e-mail.",
  );
}
export async function signIn(f: FormData) {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(128) })
    .safeParse(Object.fromEntries(f));
  if (!parsed.success) back("/entrar", "E-mail ou senha inválidos.", true);
  const client = await authClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error)
    back(
      "/entrar",
      "Não foi possível entrar. Confira e-mail, senha e confirmação da conta.",
      true,
    );
  redirect("/painel");
}
export async function signOut() {
  const s = await requireUser();
  await s.client.auth.signOut();
  redirect("/");
}
export async function recover(f: FormData) {
  const email = z.email().safeParse(val(f, "email"));
  if (!email.success)
    back("/recuperar-senha", "Informe um e-mail válido.", true);
  const client = await authClient();
  const url = origin();
  if (!url) back("/recuperar-senha", "URL do site não configurada.", true);
  const { error } = await client.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${url}/auth/callback?next=/redefinir-senha`,
  });
  if (error)
    back(
      "/recuperar-senha",
      "Serviço indisponível. Tente novamente mais tarde.",
      true,
    );
  back(
    "/recuperar-senha",
    "Se houver uma conta elegível, enviaremos as instruções por e-mail.",
  );
}
export async function changePassword(f: FormData) {
  const s = await requireUser();
  const password = val(f, "password");
  if (password.length < 12 || password.length > 128)
    back("/redefinir-senha", "Use de 12 a 128 caracteres.", true);
  const { error } = await s.client.auth.updateUser({ password });
  if (error)
    back(
      "/redefinir-senha",
      "Link inválido ou expirado. Solicite outra recuperação.",
      true,
    );
  await s.client.auth.signOut();
  back("/entrar", "Senha atualizada. Entre novamente.");
}
export async function saveProfile(f: FormData) {
  const s = await requireUser();
  const data = z
    .object({
      display_name: z.string().trim().min(2).max(100),
      city: z.string().trim().min(2).max(80),
    })
    .safeParse(Object.fromEntries(f));
  if (!data.success) back("/painel/perfil", "Confira nome e município.", true);
  const { error } = await s.client
    .from("profiles")
    .update(data.data)
    .eq("id", s.user.id);
  if (error) back("/painel/perfil", "Não foi possível salvar.", true);
  back("/painel/perfil", "Perfil atualizado.");
}
export async function toggleFavorite(f: FormData) {
  const s = await requireUser();
  const id = z.uuid().safeParse(val(f, "id"));
  if (!id.success) back("/painel/favoritos", "Oportunidade inválida.", true);
  const { data, error: readError } = await s.client
    .from("favorites")
    .select("opportunity_id")
    .eq("user_id", s.user.id)
    .eq("opportunity_id", id.data)
    .maybeSingle();
  if (readError)
    back("/painel/favoritos", "Não foi possível consultar os favoritos.", true);
  const { error } = data
    ? await s.client
        .from("favorites")
        .delete()
        .eq("user_id", s.user.id)
        .eq("opportunity_id", id.data)
    : await s.client
        .from("favorites")
        .insert({ user_id: s.user.id, opportunity_id: id.data });
  if (error)
    back(
      "/painel/favoritos",
      "Não foi possível salvar. A oportunidade pode ter sido retirada.",
      true,
    );
  revalidatePath("/painel/favoritos");
  back(
    "/painel/favoritos",
    data ? "Favorito removido." : "Oportunidade salva.",
  );
}
export async function report(f: FormData) {
  const s = await requireUser();
  const parsed = reportSchema.safeParse(Object.fromEntries(f));
  if (!parsed.success)
    back(
      "/painel/denuncias",
      "Descreva o problema em 15 a 2.000 caracteres.",
      true,
    );
  const { error } = await s.client.from("reports").insert(parsed.data);
  if (error)
    back(
      "/painel/denuncias",
      "Não foi possível registrar. Há um limite de cinco denúncias por hora.",
      true,
    );
  back("/painel/denuncias", "Denúncia registrada para revisão.");
}
export async function registerCompany(f: FormData) {
  const s = await requireUser();
  const parsed = z
    .object({ name: z.string().trim().min(3).max(150), website: externalUrl })
    .safeParse(Object.fromEntries(f));
  if (!parsed.success)
    back("/empresa", "Informe nome e site HTTPS público da organização.", true);
  const { error } = await s.client.rpc("register_organization", {
    org_name: parsed.data.name,
    org_website: parsed.data.website,
  });
  if (error)
    back(
      "/empresa",
      "Cadastro não concluído. Confirme seu e-mail e verifique se já existe uma organização nesta conta.",
      true,
    );
  back(
    "/empresa",
    "Organização cadastrada. A publicação depende de verificação humana.",
  );
}
export async function saveOpportunity(f: FormData) {
  const s = await requireUser();
  const admin = s.profile.role === "admin";
  const path = admin ? "/admin/oportunidades" : "/empresa/vagas";
  if (!admin && s.profile.role !== "company")
    back(
      "/painel",
      "Cadastre uma organização antes de enviar oportunidades.",
      true,
    );
  const parsed = opportunitySchema.safeParse(Object.fromEntries(f));
  if (!parsed.success)
    back(
      path,
      parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(" ")
        .slice(0, 700),
      true,
    );
  const data = {
    ...parsed.data,
    closing_at: parsed.data.closing_at || null,
    original_url: canonicalUrl(parsed.data.original_url),
    moderation_status: "pending",
    safety_review: false,
  };
  let organization_id: string | null = null;
  if (!admin) {
    const { data: org } = await s.client
      .from("organizations")
      .select("id")
      .eq("owner_id", s.user.id)
      .single();
    if (!org) back(path, "Organização não encontrada.", true);
    organization_id = org.id;
  }
  const id = val(f, "id");
  if (id && !z.uuid().safeParse(id).success)
    back(path, "Identificador inválido.", true);
  const result = id
    ? await s.client
        .from("opportunities")
        .update(data)
        .eq("id", id)
        .select("id")
    : await s.client
        .from("opportunities")
        .insert({ ...data, organization_id, created_by: s.user.id })
        .select("id");
  if (result.error || !result.data?.length)
    back(
      path,
      "Não foi possível salvar. Verifique origem, URL duplicada, permissões e limite de envios.",
      true,
    );
  revalidatePath("/");
  back(path, "Oportunidade salva e enviada para revisão.");
}
export async function closeOpportunity(f: FormData) {
  const s = await requireUser("company");
  const { error, data } = await s.client
    .from("opportunities")
    .update({ moderation_status: "closed" })
    .eq("id", val(f, "id"))
    .eq("created_by", s.user.id)
    .select("id");
  if (error || !data?.length)
    back("/empresa/vagas", "Não foi possível encerrar.", true);
  back("/empresa/vagas", "Oportunidade encerrada.");
}
export async function review(f: FormData) {
  const s = await requireUser("admin");
  const table = val(f, "table");
  const status = val(f, "status");
  const reason = val(f, "reason").trim();
  if (
    !["organizations", "opportunities", "reports", "sources"].includes(table) ||
    !z.uuid().safeParse(val(f, "id")).success ||
    reason.length < 20 ||
    reason.length > 2000
  )
    back("/admin", "Informe um motivo de 20 a 2.000 caracteres.", true);
  if (
    !["approved", "rejected", "suspended", "resolved", "pending"].includes(
      status,
    ) ||
    (table === "reports" && status !== "resolved")
  )
    back("/admin", "Estado inválido.", true);
  if (status === "approved" && val(f, "checked") !== "on")
    back(
      "/admin",
      "Confirme a revisão de legitimidade, segurança e elegibilidade.",
      true,
    );
  const update =
    table === "opportunities"
      ? {
          moderation_status: status,
          review_reason: reason,
          safety_review: val(f, "checked") === "on",
        }
      : table === "organizations"
        ? {
            status,
            verification_notes: reason,
            verified_at:
              status === "approved" ? new Date().toISOString() : null,
          }
        : table === "reports"
          ? { status, resolution: reason }
          : { status, permission_reference: reason };
  const { error, data } = await s.client
    .from(table)
    .update(update)
    .eq("id", val(f, "id"))
    .select("id");
  if (error || !data?.length)
    back(
      "/admin",
      "Revisão não salva. Confira origem aprovada, prazo, justificativa e campos obrigatórios.",
      true,
    );
  revalidatePath("/");
  back("/admin", "Revisão registrada na auditoria.");
}
export async function saveSource(f: FormData) {
  const s = await requireUser("admin");
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(150),
      url: externalUrl,
      permission_reference: z.string().trim().min(20).max(2000),
    })
    .safeParse(Object.fromEntries(f));
  if (!parsed.success)
    back(
      "/admin/fontes",
      "Informe uma fonte válida e a evidência de permissão.",
      true,
    );
  const { error } = await s.client
    .from("sources")
    .insert({ ...parsed.data, status: "pending" });
  if (error)
    back("/admin/fontes", "Fonte não salva. Verifique duplicidade.", true);
  back("/admin/fontes", "Fonte cadastrada para revisão.");
}
export async function importCsv(f: FormData) {
  const s = await requireUser("admin");
  if (val(f, "authorized") !== "on")
    back(
      "/admin/importar",
      "Confirme a licença ou autorização do conteúdo.",
      true,
    );
  let rows;
  try {
    rows = previewCsv(val(f, "csv"));
  } catch {
    back("/admin/importar", "CSV inválido ou acima do limite.", true);
  }
  if (!rows.length || rows.some((r) => r.error))
    back(
      "/admin/importar",
      "O lote contém erros. Corrija todos os itens no preview antes de importar.",
      true,
    );
  const { error } = await s.client.from("opportunities").insert(
    rows.map((r) => ({
      ...r.data!,
      closing_at: r.data!.closing_at || null,
      created_by: s.user.id,
      source_kind: "authorized_csv",
      moderation_status: "pending",
    })),
  );
  if (error)
    back(
      "/admin/importar",
      "Lote não importado: verifique duplicidades e fontes. Nenhum item deste lote foi salvo.",
      true,
    );
  back(
    "/admin/oportunidades",
    `${rows.length} registros importados para revisão, sem publicação automática.`,
  );
}
export async function deleteAccount(f: FormData) {
  const s = await requireUser();
  if (val(f, "confirmation") !== "EXCLUIR")
    back("/painel/privacidade", "Digite EXCLUIR para confirmar.", true);
  const { error } = await s.client.rpc("delete_own_account");
  if (error)
    back(
      "/painel/privacidade",
      "Exclusão indisponível para esta conta. Administradores precisam transferir a responsabilidade antes de encerrar.",
      true,
    );
  await s.client.auth.signOut();
  back("/", "Conta excluída.");
}
export async function acceptPolicy() {
  const s = await requireUser();
  const { error } = await s.client
    .from("consents")
    .insert({ user_id: s.user.id, policy_version: "2026-10-draft" });
  if (error)
    back("/painel/privacidade", "Registro não salvo ou já existente.", true);
  back(
    "/painel/privacidade",
    "Ciência da política registrada. Isso não autoriza marketing.",
  );
}
