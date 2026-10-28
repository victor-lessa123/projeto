import { z } from "zod";
import { isSafeExternalUrl } from "@/lib/security/urls";
export const kinds = [
  "aprendiz",
  "estagio",
  "emprego",
  "curso",
  "evento",
] as const;
export const labels: Record<string, string> = {
  aprendiz: "Jovem Aprendiz",
  estagio: "Estágio",
  emprego: "Primeiro emprego",
  curso: "Curso gratuito",
  evento: "Programa ou evento",
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
  pending: "Aguardando revisão",
  approved: "Aprovado",
  rejected: "Recusado",
  closed: "Encerrado",
  suspended: "Suspenso",
};
export const cities = [
  "Aracaju",
  "Nossa Senhora do Socorro",
  "São Cristóvão",
  "Barra dos Coqueiros",
  "Itabaiana",
  "Lagarto",
  "Estância",
  "Propriá",
  "Tobias Barreto",
  "Nossa Senhora da Glória",
];
export const externalUrl = z
  .string()
  .max(2000)
  .refine(
    isSafeExternalUrl,
    "Use uma URL HTTPS pública; encurtadores e endereços locais não são aceitos.",
  );
const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.coerce.number().int().min(0).max(10000).nullable(),
);
export const opportunitySchema = z
  .object({
    title: z.string().trim().min(6).max(150),
    description: z.string().trim().min(40).max(6000),
    kind: z.enum(kinds),
    area: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    modality: z.enum(["presencial", "remoto", "hibrido"]),
    education: z.string().trim().max(150),
    experience: z.enum(["nao", "sim", "nao_informado"]),
    salary: z.string().trim().max(100),
    min_age: optionalInt,
    max_age: optionalInt,
    age_justification: z.string().trim().max(1000),
    hours: optionalInt,
    closing_at: z
      .string()
      .refine(
        (v) =>
          !v || (!Number.isNaN(Date.parse(v)) && Date.parse(v) > Date.now()),
        "O prazo deve estar no futuro.",
      ),
    original_url: externalUrl,
    source_name: z.string().trim().min(2).max(150),
    source_url: externalUrl,
    source_id: z.preprocess(
      (v) => (v === "" ? null : v),
      z.string().uuid().nullable(),
    ),
    requirements: z.string().trim().min(10).max(3000),
    free: z.enum(["true", "false"]).transform((v) => v === "true"),
  })
  .superRefine((v, ctx) => {
    if (
      v.min_age != null &&
      (v.min_age < 14 || (v.kind === "emprego" && v.min_age < 16))
    )
      ctx.addIssue({
        code: "custom",
        path: ["min_age"],
        message:
          "Idade incompatível com trabalho. Encaminhe a situação para revisão jurídica.",
      });
    if (
      v.max_age != null &&
      (v.max_age < 14 ||
        v.max_age > 99 ||
        (v.kind === "emprego" && v.max_age < 16))
    )
      ctx.addIssue({
        code: "custom",
        path: ["max_age"],
        message: "Faixa etária incompatível com a modalidade.",
      });
    if (v.min_age != null && v.min_age > 99)
      ctx.addIssue({
        code: "custom",
        path: ["min_age"],
        message: "Idade inválida.",
      });
    if (v.min_age != null && v.max_age != null && v.max_age < v.min_age)
      ctx.addIssue({
        code: "custom",
        path: ["max_age"],
        message: "Faixa etária inválida.",
      });
    if (
      (v.min_age != null || v.max_age != null) &&
      v.age_justification.length < 20
    )
      ctx.addIssue({
        code: "custom",
        path: ["age_justification"],
        message: "Justifique a faixa etária com a referência legal e a fonte.",
      });
    if (v.kind === "curso" && !v.free)
      ctx.addIssue({
        code: "custom",
        path: ["free"],
        message: "O catálogo aceita apenas cursos gratuitos.",
      });
  });
export const reportSchema = z.object({
  opportunity_id: z.string().uuid(),
  reason: z.string().trim().min(15).max(2000),
});
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
