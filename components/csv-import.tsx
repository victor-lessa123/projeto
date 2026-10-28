"use client";
import { useState } from "react";
import { previewCsv } from "@/lib/sources";
import { importCsv } from "@/app/actions";
export function CsvImport() {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof previewCsv> | null>(
    null,
  );
  const [error, setError] = useState("");
  function check() {
    try {
      setPreview(previewCsv(csv));
      setError("");
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "CSV inválido.");
    }
  }
  return (
    <form action={importCsv} className="form-stack">
      <label className="field">
        Cole o CSV autorizado (até 100 KB / 100 registros)
        <textarea
          name="csv"
          value={csv}
          onChange={(e) => {
            setCsv(e.target.value);
            setPreview(null);
          }}
          required
          maxLength={100000}
          rows={12}
        />
      </label>
      <button type="button" onClick={check} className="button secondary">
        Validar e visualizar lote
      </button>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {preview && (
        <div className="csv-preview">
          <table>
            <caption>Preview — nenhuma publicação automática</caption>
            <thead>
              <tr>
                <th>Linha</th>
                <th>Título</th>
                <th>Origem</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r) => (
                <tr key={r.line}>
                  <td>{r.line}</td>
                  <td>{r.data?.title || "—"}</td>
                  <td>{r.data?.source_url || "—"}</td>
                  <td>{r.error || "Válido para envio à revisão"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <label className="checkbox">
        <input type="checkbox" name="authorized" required />
        <span>
          Tenho autorização ou licença para importar este conteúdo. A evidência
          deve estar registrada na fonte cadastrada.
        </span>
      </label>
      <button
        className="button"
        disabled={!preview?.length || preview.some((r) => r.error)}
      >
        Importar lote para revisão
      </button>
      <p className="small muted">
        O servidor valida novamente. URLs já existentes no banco impedem a
        inserção atômica do lote.
      </p>
    </form>
  );
}
