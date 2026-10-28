import { NextRequest, NextResponse } from "next/server";
import { db, configured } from "@/lib/db/server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code && configured()) {
    const client = await db();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          request.nextUrl.searchParams.get("next") === "/redefinir-senha"
            ? "/redefinir-senha"
            : "/painel",
          request.url,
        ),
      );
  }
  return NextResponse.redirect(
    new URL(
      "/entrar?erro=Link inválido ou expirado. Solicite um novo e-mail.",
      request.url,
    ),
  );
}
