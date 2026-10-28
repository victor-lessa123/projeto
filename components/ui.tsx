import { Submit } from "@/components/submit";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  MapPin,
  Clock3,
  Building2,
  ArrowRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { labels, cities } from "@/lib/validation";
import type { Opportunity, Params } from "@/lib/db/catalog";
import { catalog, date } from "@/lib/db/catalog";
export function Notice({ params }: { params: Params }) {
  return (
    <>
      {params.erro && (
        <p role="alert" className="notice error">
          {params.erro}
        </p>
      )}
      {params.mensagem && (
        <p role="status" className="notice">
          {params.mensagem}
        </p>
      )}
    </>
  );
}
export function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  required = true,
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="field">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </label>
  );
}
export function Select({
  label,
  name,
  options,
  value = "",
}: {
  label: string;
  name: string;
  options: (string | [string, string])[];
  value?: string;
}) {
  return (
    <label className="field">
      {label}
      <select name={name} defaultValue={value}>
        {options.map((o) => {
          const [v, l] = typeof o === "string" ? [o, o] : o;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </label>
  );
}
export function Heading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children && <div className="muted">{children}</div>}
    </div>
  );
}
export function Sources() {
  return (
    <div className="source-links">
      <a
        href="https://www.se.senac.br/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Senac Sergipe <ArrowUpRight size={15} />
      </a>
      <a
        href="https://www.se.senai.br/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Senai Sergipe <ArrowUpRight size={15} />
      </a>
      <a
        href="https://ciee.org.br/quero-uma-vaga/"
        target="_blank"
        rel="noopener noreferrer"
      >
        CIEE <ArrowUpRight size={15} />
      </a>
      <a
        href="https://loja.sebrae.com.br/cursos/cursos-online"
        target="_blank"
        rel="noopener noreferrer"
      >
        Sebrae <ArrowUpRight size={15} />
      </a>
    </div>
  );
}
export function Card({ item }: { item: Opportunity }) {
  return (
    <article className="opportunity-card">
      <div className="flex-between">
        <span className={`tag ${item.kind === "curso" ? "green" : ""}`}>
          {labels[item.kind]}
        </span>
        <span className="muted small">{labels[item.modality]}</span>
      </div>
      <h3>
        <Link
          href={`/${item.kind === "curso" ? "cursos" : "oportunidades"}/${item.slug}`}
        >
          {item.title}
        </Link>
      </h3>
      <p>
        <Building2 size={16} />
        {item.source_name}
      </p>
      <p>
        <MapPin size={16} />
        {item.city} · {item.state}
      </p>
      <p className="small">
        <Clock3 size={16} />
        Verificado em {date(item.verified_at)}
      </p>
      <div className="card-bottom">
        <span>{item.salary || "Remuneração não informada"}</span>
        <ArrowUpRight size={20} />
      </div>
    </article>
  );
}
export function Empty({
  error = false,
  unconfigured = false,
}: {
  error?: boolean;
  unconfigured?: boolean;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        {error ? <ShieldCheck size={30} /> : <Search size={30} />}
      </div>
      <h3>
        {error
          ? "Não foi possível carregar o catálogo"
          : "Uma boa oportunidade merece ser conferida."}
      </h3>
      <p>
        {error
          ? "A conexão com o catálogo falhou. Tente novamente mais tarde."
          : "Ainda não há oportunidades aprovadas para esta busca. Você pode consultar as instituições de referência enquanto preparamos o catálogo."}
      </p>
      {unconfigured && (
        <p className="small">
          Catálogo ainda não conectado. Contas e publicações dependem da
          configuração do serviço.
        </p>
      )}
      <Sources />
    </div>
  );
}
export function SearchForm({
  params = {},
  compact = false,
  course = false,
}: {
  params?: Params;
  compact?: boolean;
  course?: boolean;
}) {
  return (
    <form
      action={course ? "/cursos" : "/oportunidades"}
      className={compact ? "search-bar" : "filters"}
    >
      <label className="field">
        <span>
          <Search size={17} /> O que você procura?
        </span>
        <input
          name="q"
          placeholder={
            course
              ? "Curso, área ou instituição"
              : "Cargo, área ou palavra-chave"
          }
          defaultValue={params.q}
          maxLength={120}
        />
      </label>
      <label className="field">
        <span>
          <MapPin size={17} /> Onde?
        </span>
        <input
          name="city"
          placeholder="Todas as cidades de Sergipe"
          list="cities"
          defaultValue={params.city}
        />
        <datalist id="cities">
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      {!compact && (
        <>
          <Select
            label="Tipo de oportunidade"
            name="kind"
            value={course ? "curso" : params.kind}
            options={
              course
                ? [["curso", "Cursos gratuitos"]]
                : [
                    ["", "Todos os tipos"],
                    ["aprendiz", "Jovem Aprendiz"],
                    ["estagio", "Estágio"],
                    ["emprego", "Primeiro emprego"],
                    ["evento", "Programas e eventos"],
                  ]
            }
          />
          <Select
            label="Modalidade"
            name="modality"
            value={params.modality}
            options={[
              ["", "Todas"],
              ["presencial", "Presencial"],
              ["remoto", "Remoto"],
              ["hibrido", "Híbrido"],
            ]}
          />
          <Select
            label="Experiência"
            name="experience"
            value={params.experience}
            options={[
              ["", "Qualquer"],
              ["nao", "Sem experiência"],
              ["sim", "Exige experiência"],
            ]}
          />
          <Field
            label="Área"
            name="area"
            required={false}
            defaultValue={params.area}
          />
          <Field
            label="Escolaridade"
            name="education"
            required={false}
            defaultValue={params.education}
          />
          <Field
            label="Idade (opcional)"
            name="age"
            type="number"
            required={false}
            defaultValue={params.age}
          />
          <Field
            label="Publicadas a partir de"
            name="since"
            type="date"
            required={false}
            defaultValue={params.since}
          />
        </>
      )}
      <Submit className="button" type="submit">
        Buscar oportunidades <ArrowRight size={18} />
      </Submit>
      {!compact && (
        <Link
          className="text-link"
          href={course ? "/cursos" : "/oportunidades"}
        >
          Limpar filtros
        </Link>
      )}
    </form>
  );
}
export async function Catalog({
  params,
  course = false,
  title,
}: {
  params: Params;
  course?: boolean;
  title?: string;
}) {
  const result = await catalog(params, course);
  const page = Math.max(1, Number(params.page) || 1);
  const next = new URLSearchParams(
    Object.entries(params).filter(
      (p): p is [string, string] => typeof p[1] === "string",
    ),
  );
  return (
    <>
      <Heading
        eyebrow="Um próximo passo, muitas possibilidades"
        title={
          title ||
          (course ? "Aprender abre caminhos." : "Encontre seu próximo começo.")
        }
      >
        <p>
          {course
            ? "Capacitações gratuitas, com origem e requisitos para você conferir."
            : "Oportunidades em Sergipe, com informação clara e revisão antes de publicar."}
        </p>
      </Heading>
      <SearchForm params={params} course={course} />
      <div className="flex-between result-count">
        <p>
          <strong>{result.count}</strong>{" "}
          {result.count === 1
            ? "oportunidade encontrada"
            : "oportunidades encontradas"}
        </p>
        <span className="small muted">
          {params.q ? "Relevância e recência" : "Mais recentes primeiro"}
        </span>
      </div>
      {params.age && (
        <p className="notice">
          A idade sozinha não determina elegibilidade. Confira os critérios da
          instituição.
        </p>
      )}
      {result.items.length ? (
        <div className="cards">
          {result.items.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Empty
          error={result.state === "error"}
          unconfigured={result.state === "unconfigured"}
        />
      )}
      <nav aria-label="Paginação" className="pagination">
        {page > 1 && (
          <Link
            className="button secondary"
            href={`?${new URLSearchParams({ ...Object.fromEntries(next), page: String(page - 1) })}`}
          >
            Anterior
          </Link>
        )}
        {result.count > page * 12 && (
          <Link
            className="button secondary"
            href={`?${new URLSearchParams({ ...Object.fromEntries(next), page: String(page + 1) })}`}
          >
            Próxima
          </Link>
        )}
      </nav>
    </>
  );
}
