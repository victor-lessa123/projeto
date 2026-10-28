import Link from "next/link";
export default function NotFound() {
  return (
    <div className="content-shell">
      <h1>Esse caminho não está disponível.</h1>
      <p>
        A página pode ter mudado ou a oportunidade foi retirada do catálogo.
      </p>
      <Link href="/oportunidades" className="button">
        Voltar às oportunidades
      </Link>
    </div>
  );
}
