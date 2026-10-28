import { parse } from "csv-parse/browser/esm/sync";
import { opportunitySchema } from "@/lib/validation";
import { canonicalUrl } from "@/lib/security/urls";
export interface SourceAdapter {
  name: string;
  authorizationReference: string;
  fetch(): Promise<unknown[]>;
}
export function previewCsv(input: string) {
  if (new TextEncoder().encode(input).length > 100_000)
    throw new Error("CSV limitado a 100 KB.");
  const records: Record<string, string>[] = parse(input, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    max_record_size: 12000,
  });
  if (records.length > 100)
    throw new Error("Importe no máximo 100 registros por lote.");
  const seen = new Set<string>();
  return records.map((record, index) => {
    const result = opportunitySchema.safeParse(record);
    if (!result.success)
      return {
        line: index + 2,
        data: null,
        error: result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      };
    const url = canonicalUrl(result.data.original_url);
    if (seen.has(url))
      return {
        line: index + 2,
        data: null,
        error: "URL duplicada neste lote.",
      };
    seen.add(url);
    return {
      line: index + 2,
      data: { ...result.data, original_url: url },
      error: null,
    };
  });
}
