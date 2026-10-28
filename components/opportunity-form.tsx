import { Submit } from "@/components/submit";
import { saveOpportunity } from "@/app/actions";
import { Field, Select } from "@/components/ui";
import type { Opportunity } from "@/lib/db/catalog";
export function OpportunityForm({
  item,
  admin = false,
  sources = [],
}: {
  item?: Opportunity;
  admin?: boolean;
  sources?: { id: string; name: string }[];
}) {
  return (
    <form action={saveOpportunity} className="form-stack">
      {item && <input type="hidden" name="id" value={item.id} />}
      <p className="notice">
        Nenhum envio é publicado automaticamente. Inclua um resumo próprio ou
        autorizado e não copie textos protegidos. Não colete documentos dos
        candidatos.
      </p>
      <Field
        label="Título"
        name="title"
        defaultValue={item?.title}
        maxLength={150}
      />
      <label className="field">
        Descrição original ou autorizada
        <textarea
          name="description"
          required
          minLength={40}
          maxLength={6000}
          defaultValue={item?.description}
        />
      </label>
      <div className="form-grid">
        <Select
          label="Tipo"
          name="kind"
          value={item?.kind || "aprendiz"}
          options={[
            ["aprendiz", "Jovem Aprendiz"],
            ["estagio", "Estágio"],
            ["emprego", "Primeiro emprego"],
            ["curso", "Curso gratuito"],
            ["evento", "Programa ou evento"],
          ]}
        />
        <Field
          label="Área"
          name="area"
          defaultValue={item?.area}
          maxLength={80}
        />
        <Field
          label="Município de Sergipe"
          name="city"
          defaultValue={item?.city}
          maxLength={80}
        />
        <Select
          label="Modalidade"
          name="modality"
          value={item?.modality || "presencial"}
          options={[
            ["presencial", "Presencial"],
            ["remoto", "Remoto"],
            ["hibrido", "Híbrido"],
          ]}
        />
        <Field
          label="Escolaridade (se informada)"
          name="education"
          defaultValue={item?.education}
          required={false}
          maxLength={150}
        />
        <Select
          label="Experiência"
          name="experience"
          value={item?.experience || "nao_informado"}
          options={[
            ["nao_informado", "Não informado"],
            ["nao", "Não exigida"],
            ["sim", "Exigida"],
          ]}
        />
        <Field
          label="Remuneração e unidade (se divulgadas)"
          name="salary"
          defaultValue={item?.salary}
          required={false}
          maxLength={100}
        />
        <Field
          label="Carga horária (se divulgada; explicite unidade na descrição)"
          name="hours"
          type="number"
          defaultValue={item?.hours?.toString()}
          required={false}
        />
        <Field
          label="Idade mínima declarada (opcional)"
          name="min_age"
          type="number"
          required={false}
          defaultValue={item?.min_age?.toString()}
        />
        <Field
          label="Idade máxima declarada (opcional)"
          name="max_age"
          type="number"
          required={false}
          defaultValue={item?.max_age?.toString()}
        />
      </div>
      <label className="field">
        Justificativa legal e fonte para qualquer faixa etária
        <textarea
          name="age_justification"
          maxLength={1000}
          defaultValue={item?.age_justification}
        />
      </label>
      <label className="field">
        Requisitos e restrições legais
        <textarea
          name="requirements"
          required
          minLength={10}
          maxLength={3000}
          defaultValue={item?.requirements}
        />
      </label>
      <div className="form-grid">
        <Field
          label="Prazo (se informado)"
          name="closing_at"
          type="datetime-local"
          required={false}
          defaultValue={
            item?.closing_at
              ? new Date(item.closing_at).toISOString().slice(0, 16)
              : ""
          }
        />
        <Select
          label="Atividade gratuita? (obrigatório para cursos)"
          name="free"
          value={item?.free ? "true" : "false"}
          options={[
            ["false", "Não se aplica"],
            ["true", "Sim, gratuita"],
          ]}
        />
        <Field
          label="Instituição / fonte"
          name="source_name"
          defaultValue={item?.source_name}
          maxLength={150}
        />
        <Field
          label="Página de origem HTTPS"
          name="source_url"
          type="url"
          defaultValue={item?.source_url}
        />
        <Field
          label="URL HTTPS de inscrição oficial"
          name="original_url"
          type="url"
          defaultValue={item?.original_url}
        />
        {admin ? (
          <Select
            label="Fonte previamente cadastrada"
            name="source_id"
            value={item?.source_id || ""}
            options={[
              ["", "Selecione para poder publicar"],
              ...sources.map((s) => [s.id, s.name] as [string, string]),
            ]}
          />
        ) : (
          <input name="source_id" type="hidden" value="" />
        )}
      </div>
      <p className="small muted">
        Horários informados neste formulário são interpretados em UTC. Confirme
        a equivalência no edital. Aprendizagem, estágio e emprego têm regras
        diferentes. Revisão humana obrigatória para todos os anúncios, incluindo
        segurança de adolescentes.
      </p>
      <Submit className="button">Salvar e enviar para revisão</Submit>
    </form>
  );
}
