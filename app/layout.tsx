import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Network, ShieldCheck } from "lucide-react";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Network Jobs — Seu próximo começo, em Sergipe",
    template: "%s | Network Jobs",
  },
  description:
    "Primeiro emprego, estágio, aprendizagem e cursos gratuitos em Sergipe. Informação clara para dar seu próximo passo.",
  robots: { index: true, follow: true },
  openGraph: { locale: "pt_BR", type: "website", siteName: "Network Jobs" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <div className="topline">
          <span>Feito para quem está começando.</span>
          <span>
            Sergipe, Brasil <span className="live-dot" />
          </span>
        </div>
        <header className="header">
          <Link href="/" className="brand" aria-label="Network Jobs — início">
            <span className="brand-symbol">
              <Network size={24} />
            </span>
            network<span className="brand-light">jobs</span>
            <span className="brand-period">.</span>
          </Link>
          <nav aria-label="Principal">
            <Link href="/oportunidades">Oportunidades</Link>
            <Link href="/cursos">Cursos gratuitos</Link>
            <Link href="/como-funciona">Como funciona</Link>
          </nav>
          <div className="header-actions">
            <Link href="/entrar" className="login-link">
              Entrar
            </Link>
            <Link href="/cadastro" className="button small-button">
              Começar agora <ArrowUpRight size={16} />
            </Link>
          </div>
        </header>
        <main id="conteudo">{children}</main>
        <footer>
          <div className="footer-top">
            <div>
              <Link className="brand" href="/">
                network<span className="brand-light">jobs</span>
                <span className="brand-period">.</span>
              </Link>
              <p>
                Conectando o seu agora
                <br />
                com o que vem pela frente.
              </p>
              <span className="small">De Sergipe, para novos caminhos.</span>
            </div>
            <div>
              <h3>Encontre seu caminho</h3>
              <Link href="/jovem-aprendiz">Jovem Aprendiz</Link>
              <Link href="/estagios">Estágios</Link>
              <Link href="/primeiro-emprego">Primeiro emprego</Link>
              <Link href="/cursos">Cursos gratuitos</Link>
            </div>
            <div>
              <h3>Sobre a plataforma</h3>
              <Link href="/sobre">Sobre nós</Link>
              <Link href="/empresa">Para empresas</Link>
              <Link href="/seguranca">Sua segurança</Link>
              <Link href="/perguntas-frequentes">Perguntas frequentes</Link>
              <Link href="/contato">Contato</Link>
            </div>
            <div>
              <h3>Respeito aos seus dados</h3>
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/termos">Termos de uso</Link>
              <Link href="/acessibilidade">Acessibilidade</Link>
              <Link href="/painel">Minha conta</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Network Jobs. Seu começo importa.
            </span>
            <span>
              <ShieldCheck size={16} /> Gratuito para candidatos. Sempre.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
