"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="content-shell">
      <h1>Não conseguimos carregar agora.</h1>
      <p>
        Houve uma falha ao consultar o serviço. Nenhuma operação foi confirmada.
      </p>
      <button className="button" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
