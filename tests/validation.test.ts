import { describe, it, expect } from "vitest";
import { isSafeExternalUrl, canonicalUrl } from "@/lib/security/urls";
import { opportunitySchema, normalize } from "@/lib/validation";
import { previewCsv } from "@/lib/sources";
export const fixture = {
  title: "Exemplo sintético de aprendizagem",
  description:
    "Registro sintético usado exclusivamente pelos testes automatizados, nunca pelo catálogo público.",
  kind: "aprendiz",
  area: "Tecnologia",
  city: "Aracaju",
  modality: "presencial",
  education: "Ensino médio",
  experience: "nao",
  salary: "",
  min_age: "14",
  max_age: "24",
  age_justification:
    "Faixa explicitamente documentada em fonte de teste, para aprendizagem.",
  hours: "",
  closing_at: "",
  original_url: "https://instituicao.edu.br/edital",
  source_name: "Instituição sintética",
  source_url: "https://instituicao.edu.br/",
  source_id: "",
  requirements: "Vínculo e requisitos descritos no edital de teste.",
  free: "false",
};
describe("validations", () => {
  it.each([
    "http://example.com",
    "https://localhost/a",
    "https://127.0.0.1/a",
    "https://[::1]/",
    "https://user:pass@org.com/",
    "https://bit.ly/a",
    "https://sub.tinyurl.com/a",
    "https://empresa.local/",
    "javascript:alert(1)",
    "https://org.com:9090/a",
    "https://2130706433/",
  ])("rejects unsafe URL %s", (url) =>
    expect(isSafeExternalUrl(url)).toBe(false),
  );
  it("allows HTTPS and canonicalizes tracking", () => {
    expect(isSafeExternalUrl("https://www.se.senac.br/")).toBe(true);
    expect(canonicalUrl("https://org.com/a?utm_source=x&b=2#section")).toBe(
      "https://org.com/a?b=2",
    );
  });
  it("normalizes accents", () =>
    expect(normalize("ESTÁGIO São Cristóvão")).toBe("estagio sao cristovao"));
  it("keeps absent salary and hours absent", () => {
    const v = opportunitySchema.parse(fixture);
    expect(v.salary).toBe("");
    expect(v.hours).toBeNull();
  });
  it("rejects ordinary employment below 16 and ungrounded age restrictions", () => {
    expect(
      opportunitySchema.safeParse({ ...fixture, kind: "emprego" }).success,
    ).toBe(false);
    expect(
      opportunitySchema.safeParse({ ...fixture, age_justification: "" })
        .success,
    ).toBe(false);
  });
  it("rejects paid courses and past deadlines", () => {
    expect(
      opportunitySchema.safeParse({ ...fixture, kind: "curso" }).success,
    ).toBe(false);
    expect(
      opportunitySchema.safeParse({ ...fixture, closing_at: "2000-01-01" })
        .success,
    ).toBe(false);
  });
  it("previews duplicates and missing provenance as errors", () => {
    const keys = Object.keys(fixture);
    const csv = [
      keys.join(","),
      ...Array.from({ length: 2 }, () =>
        keys
          .map((k) => JSON.stringify(fixture[k as keyof typeof fixture]))
          .join(","),
      ),
    ].join("\n");
    const rows = previewCsv(csv);
    expect(rows[0].error).toBeNull();
    expect(rows[1].error).toContain("duplicada");
    const invalid = previewCsv("title,source_url\nExemplo,");
    expect(invalid[0].error).toBeTruthy();
  });
  it("limits imports", () =>
    expect(() => previewCsv("a".repeat(100001))).toThrow("100 KB"));
});

it("rejects employment targeted only by a maximum age below 16", () =>
  expect(
    opportunitySchema.safeParse({
      ...fixture,
      kind: "emprego",
      min_age: "",
      max_age: "15",
    }).success,
  ).toBe(false));
