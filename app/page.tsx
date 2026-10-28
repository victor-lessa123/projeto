export const metadata = { alternates: { canonical: "/" } };
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Sprout,
  Compass,
  Check,
  ShieldCheck,
  MousePointer2,
  MapPin,
} from "lucide-react";
import { catalog } from "@/lib/db/catalog";
import { Card, Empty, SearchForm, Sources, Notice } from "@/components/ui";
const paths = [
  {
    icon: Sprout,
    title: "Jovem Aprendiz",
    description: "Seu primeiro contato com o mundo do trabalho.",
    href: "/jovem-aprendiz",
    color: "mint",
  },
  {
    icon: GraduationCap,
    title: "Estágio",
    description: "A teoria encontra a prática. E o seu talento.",
    href: "/estagios",
    color: "blue",
  },
  {
    icon: BriefcaseBusiness,
    title: "Primeiro emprego",
    description: "Experiência se constrói. Comece por aqui.",
    href: "/primeiro-emprego",
    color: "peach",
  },
  {
    icon: BookOpen,
    title: "Cursos gratuitos",
    description: "Aprenda algo novo e vá mais longe.",
    href: "/cursos",
    color: "lilac",
  },
];
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const results = await catalog();
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">
              <span className="live-dot" /> NOVOS CAMINHOS EM SERGIPE
            </span>
            <h1>
              Seu futuro começa
              <br />
              com uma{" "}
              <span>
                oportunidade<span className="word-dot">.</span>
              </span>
            </h1>
            <p>
              O primeiro passo não precisa ser sozinho.
              <br />
              Encontre vagas, estágios e cursos para construir
              <br className="desktop-break" /> o caminho que faz sentido para
              você.
            </p>
            <div className="hero-notes">
              <span>
                <Check size={16} /> Gratuito para você
              </span>
              <span>
                <Check size={16} /> Sem experiência? Tudo bem.
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Ilustração: caminhos que conectam aprendizado, trabalho e novos começos"
            role="img"
          >
            <div className="art-dots" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="floating-label label-top">
              <span className="icon-tile mint">
                <Sprout size={25} />
              </span>
              <div>
                Um novo começo<small>O seu próximo passo está aqui.</small>
              </div>
              <span className="spark">✦</span>
            </div>
            <div className="art-main">
              <span className="art-kicker">SEU TALENTO TEM LUGAR.</span>
              <div className="art-arrow">
                <ArrowUpRight strokeWidth={1.6} />
              </div>
              <div className="art-main-bottom">
                <span>
                  Do primeiro passo
                  <br />
                  às grandes conquistas.
                </span>
                <span className="mini-sun">✳</span>
              </div>
            </div>
            <div className="floating-label label-bottom">
              <span className="round-check">
                <Check size={19} />
              </span>
              <div>
                Mais possibilidades.<small>Mais perto de você.</small>
              </div>
              <MapPin size={19} />
            </div>
            <span className="art-star">✳</span>
          </div>
        </div>
        <div className="hero-search">
          <SearchForm compact />
          <p>
            <ShieldCheck size={14} /> Informação transparente. Inscrição direto
            com a instituição responsável.
          </p>
        </div>
      </section>
      <div className="section-wrap">
        <Notice params={await searchParams} />
        <section className="path-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">CADA HISTÓRIA TEM UM COMEÇO</p>
              <h2>Qual vai ser o seu próximo passo?</h2>
            </div>
            <span className="muted small">
              Explore as possibilidades <span aria-hidden="true">↘</span>
            </span>
          </div>
          <div className="path-grid">
            {paths.map(({ icon: Icon, title, description, href, color }) => (
              <Link href={href} className="path-card" key={href}>
                <span className={`icon-tile ${color}`}>
                  <Icon size={25} />
                </span>
                <ArrowUpRight className="path-arrow" size={20} />
                <h3>{title}</h3>
                <p>{description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="recent-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">OLHE PARA O QUE VEM AÍ</p>
              <h2>Seu próximo começo pode estar aqui.</h2>
              <p className="muted">
                Oportunidades revisadas, com origem e informação para você
                decidir.
              </p>
            </div>
            <Link className="text-link" href="/oportunidades">
              Ver oportunidades <ArrowRight size={18} />
            </Link>
          </div>
          {results.items.length ? (
            <div className="cards">
              {results.items.slice(0, 3).map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Empty error={results.state === "error"} />
          )}
        </section>
        <section className="how-section">
          <div className="how-intro">
            <p className="eyebrow">DESCOMPLICAR É O PRIMEIRO PASSO</p>
            <h2>
              Seu talento.
              <br />
              Um mundo de
              <br />
              <span>possibilidades.</span>
            </h2>
            <Link href="/como-funciona" className="text-link">
              Entenda como funciona <ArrowRight size={17} />
            </Link>
          </div>
          <div className="steps">
            {[
              [
                Compass,
                "01",
                "Encontre seu caminho",
                "Busque pelo que você quer aprender ou fazer, na sua cidade ou de onde estiver.",
              ],
              [
                ShieldCheck,
                "02",
                "Confira cada detalhe",
                "Veja requisitos, prazos e a fonte. Informação clara para uma escolha segura.",
              ],
              [
                MousePointer2,
                "03",
                "Dê o próximo passo",
                "Acesse o site da instituição e faça sua inscrição pelos canais oficiais.",
              ],
            ].map(([Icon, num, title, text]) => {
              const I = Icon as typeof Compass;
              return (
                <div className="step" key={String(num)}>
                  <span className="step-number">{String(num)}</span>
                  <I size={24} />
                  <div>
                    <h3>{String(title)}</h3>
                    <p>{String(text)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="learning-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">PREPARE-SE PARA CHEGAR LÁ</p>
              <h2>Pequenos aprendizados. Grandes viradas.</h2>
            </div>
          </div>
          <div className="guide-grid">
            {[
              [
                "guia-curriculo",
                "O COMEÇO",
                "Seu primeiro currículo, sem complicação.",
                "blue",
              ],
              [
                "guia-entrevista",
                "A PREPARAÇÃO",
                "Entrevista marcada? Vá com confiança.",
                "mint",
              ],
              [
                "seguranca",
                "O CUIDADO",
                "Uma oportunidade de verdade não cobra para contratar.",
                "peach",
              ],
            ].map(([href, kicker, title, color]) => (
              <Link
                key={href}
                href={`/${href}`}
                className={`guide-card ${color}`}
              >
                <span className="small">{kicker}</span>
                <h3>{title}</h3>
                <span className="text-link">
                  Ler orientação <ArrowUpRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="references">
          <p className="eyebrow">INFORMAÇÃO COMEÇA NA FONTE</p>
          <h2>Instituições para acompanhar de perto.</h2>
          <p className="muted">
            Referências de educação e empregabilidade. Sem vínculo ou parceria
            declarada.
          </p>
          <Sources />
        </section>
        <section className="safety-banner">
          <ShieldCheck size={36} />
          <div>
            <h3>Seu futuro merece segurança.</h3>
            <p>
              Nunca pague para participar de uma seleção. Cuide dos seus dados e
              confira a origem dos anúncios.
            </p>
          </div>
          <Link className="button secondary" href="/seguranca">
            Saiba se proteger <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </>
  );
}
