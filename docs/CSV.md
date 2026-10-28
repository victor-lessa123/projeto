# Importação CSV autorizada

Acesse `/admin/importar`. Texto UTF-8, cabeçalho obrigatório, delimitador vírgula, aspas duplas conforme CSV. Limites: 100 KB, 100 registros e 12 KB por linha. O preview mostra validação e duplicidades internas; a unicidade do banco barra URLs preexistentes. O lote é inserido atomicamente e sempre pendente. Não se realiza fetch de URL.

Colunas (todas devem estar presentes; campos opcionais aceitam vazio):

```text
title,description,kind,area,city,modality,education,experience,salary,min_age,max_age,age_justification,hours,closing_at,original_url,source_name,source_url,source_id,requirements,free
```

- `kind`: aprendiz, estagio, emprego, curso, evento.
- `modality`: presencial, remoto, hibrido.
- `experience`: nao, sim, nao_informado.
- `free`: true para curso gratuito; false nos demais casos quando não aplicável.
- `source_id`: UUID de fonte aprovada; pode estar vazio na submissão, mas deve ser definido na edição antes de publicação por curadoria administrativa.
- `closing_at`: ISO 8601 com fuso, por exemplo data real futura terminando em `-03:00`, ou vazio. Não invente prazo.
- `salary`: valor, moeda e unidade apenas se divulgados; caso contrário vazio.
- Faixa etária exige justificativa legal e fonte explícita. `hours` é opcional; a descrição precisa deixar a unidade clara.

Não há CSV de “vagas reais” de demonstração. Fixtures sintéticas vivem apenas nos testes e não são seeds de produção. Cada revisão deve conferir título, resumo autorizado, cidade, instituição, pré-requisitos e links com a fonte original.
