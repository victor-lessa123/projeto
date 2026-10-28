export const content: Record<
  string,
  { title: string; intro: string; sections: [string, string][] }
> = {
  "como-funciona": {
    title: "Um próximo passo, com informação.",
    intro:
      "O Network Jobs ajuda você a encontrar oportunidades e entender os requisitos antes de se inscrever.",
    sections: [
      [
        "1. Busque no seu ritmo",
        "Escolha uma área, um tipo de oportunidade e um município de Sergipe. Combine filtros e compartilhe a URL da sua busca.",
      ],
      [
        "2. Confira os detalhes",
        "Leia requisitos, instituição, origem e data de verificação. A idade, sozinha, não determina se você pode participar. Quando faltarem informações, consulte a instituição.",
      ],
      [
        "3. Inscreva-se na fonte",
        "A candidatura acontece no site externo indicado. O Network Jobs não envia sua inscrição nem garante contratação. Favoritos ficam na sua conta.",
      ],
      [
        "Para organizações",
        "Crie uma conta e cadastre a organização no painel de empresas. Uma pessoa responsável precisa verificar sua legitimidade antes de qualquer publicação. Cada anúncio passa por revisão.",
      ],
    ],
  },
  sobre: {
    title: "Seu começo importa.",
    intro:
      "O Network Jobs é uma plataforma em desenvolvimento para conectar jovens de Sergipe a informação sobre trabalho e formação.",
    sections: [
      [
        "Um começo local",
        "Nosso foco inicial é Sergipe. Aprendizagem, estágio, primeiro emprego e capacitação gratuita têm requisitos diferentes e aparecem separados.",
      ],
      [
        "Transparência antes de volume",
        "Não inventamos vagas, números, salários ou parcerias. Sem oportunidades aprovadas, mostramos um catálogo vazio e referências para consulta.",
      ],
      [
        "Gratuito para candidatos",
        "Buscar, criar uma conta, salvar favoritos e acessar a inscrição não têm custo para candidatos.",
      ],
    ],
  },
  seguranca: {
    title: "Uma oportunidade não pode custar sua segurança.",
    intro:
      "Desconfie de taxas para seleção, depósitos antecipados e promessas de contratação garantida.",
    sections: [
      [
        "Confira a origem",
        "Abra o site oficial, confira o endereço e procure contatos institucionais independentes. Um endereço HTTPS não garante legitimidade. Não envie documentos por perfis não verificados.",
      ],
      [
        "Proteja seus dados",
        "Não envie CPF, RG, documentos bancários ou endereço residencial para contatos desconhecidos. Nesta plataforma, seu perfil não é público.",
      ],
      [
        "Adolescentes merecem proteção",
        "A regra geral brasileira permite trabalho a partir dos 16 anos e aprendizagem a partir dos 14. Trabalho noturno, perigoso ou insalubre é vedado a menores de 18. Estágio depende de vínculo educacional e outros requisitos. Em dúvida, confirme em fonte oficial e procure orientação responsável.",
      ],
      [
        "Denuncie",
        "Use o formulário de denúncia em cada oportunidade. É necessário entrar para reduzir spam e permitir acompanhar o registro. Em situações urgentes, procure os canais públicos competentes; o site não é um serviço de emergência.",
      ],
    ],
  },
  "perguntas-frequentes": {
    title: "Antes do próximo passo, suas dúvidas.",
    intro: "Informação simples para usar a plataforma com confiança.",
    sections: [
      [
        "Preciso pagar?",
        "Não. O Network Jobs é gratuito para candidatos. Nunca pague para participar de uma seleção anunciada aqui.",
      ],
      [
        "A candidatura é feita aqui?",
        "Não no MVP. Você acessa o site externo da instituição responsável e segue as instruções de lá. Salvar um favorito não envia candidatura.",
      ],
      [
        "Todas as empresas podem publicar?",
        "Não. O cadastro começa pendente e depende de verificação humana. Os anúncios também precisam ser aprovados.",
      ],
      [
        "Por que não há vagas na minha cidade?",
        "Não criamos oportunidades fictícias. Confira outros filtros e as instituições de referência.",
      ],
      [
        "Há alertas por e-mail?",
        "Ainda não. Alertas e recomendações estão previstos para uma fase posterior e dependerão de consentimento específico.",
      ],
    ],
  },
  contato: {
    title: "Fale com a plataforma.",
    intro:
      "O canal público de atendimento ainda precisa ser definido pelo responsável antes do lançamento.",
    sections: [
      [
        "Problema em uma oportunidade",
        "Use a denúncia na página do anúncio e acompanhe o protocolo em Minha conta → Denúncias.",
      ],
      [
        "Seus dados",
        "Você pode editar o perfil ou excluir a conta em Minha conta → Privacidade. O contato do controlador para demais direitos deve ser publicado antes de abrir o serviço ao público.",
      ],
      [
        "Instituições e parcerias",
        "Nenhuma parceria com instituições citadas é presumida. O responsável deve disponibilizar um contato institucional para pedidos de autorização e propostas.",
      ],
    ],
  },
  privacidade: {
    title: "Seus dados, com respeito.",
    intro:
      "Minuta de aviso de privacidade — versão 2026-10. Precisa de revisão jurídica, identificação do controlador e contato antes de publicação pública.",
    sections: [
      [
        "O que coletamos",
        "Nome de exibição, e-mail, senha tratada pelo provedor de autenticação, município, favoritos e denúncias. Organizações também informam nome e site. Não pedimos CPF, RG, data de nascimento, endereço exato nem currículo no MVP.",
      ],
      [
        "Finalidades e acesso",
        "Os dados servem à conta, aos favoritos, à segurança e à moderação. Perfis não são públicos. Administradores têm acesso restrito às tarefas de operação; a política e a base legal, inclusive para adolescentes, precisam de avaliação jurídica específica.",
      ],
      [
        "Provedores e cookies",
        "Supabase é o provedor previsto de autenticação e banco; Vercel é uma opção de hospedagem. A região de armazenamento e eventual transferência internacional dependem da configuração do proprietário. Apenas cookies de sessão essenciais são usados; não há analytics nem publicidade comportamental.",
      ],
      [
        "Direitos e exclusão",
        "Você pode alterar seu perfil e excluir sua conta no painel. A exclusão remove perfil, favoritos e denúncias, além de anúncios e organização vinculados quando aplicável. A auditoria de moderação conserva apenas a referência do registro e do estado, sem o vínculo com o perfil excluído. O canal do controlador deve atender acesso, correção e demais direitos.",
      ],
      [
        "Retenção proposta",
        "A conta é mantida enquanto ativa. Propõe-se retenção mínima de logs de moderação por até 180 dias, sem conteúdo sensível. A rotina de limpeza, as cópias de segurança e os prazos legais precisam ser aprovados e configurados antes do lançamento.",
      ],
      [
        "Adolescentes",
        "O melhor interesse e a privacidade por padrão orientam o projeto. O operador precisa revisar a base legal e as condições de atendimento de crianças e adolescentes com profissional responsável. Não declaramos conformidade jurídica definitiva.",
      ],
    ],
  },
  termos: {
    title: "Termos claros para um começo seguro.",
    intro:
      "Minuta para revisão do responsável e de assessoria jurídica antes de abrir a plataforma ao público.",
    sections: [
      [
        "Serviço de informação",
        "O Network Jobs organiza informações de oportunidades aprovadas e direciona para fontes externas. Não garante contratação, disponibilidade de vagas ou inscrições em sites de terceiros.",
      ],
      [
        "Uso responsável",
        "Não publique taxas de seleção, golpes, conteúdo discriminatório, personificação de instituições ou atividades incompatíveis com a proteção de adolescentes. Não copie conteúdo sem permissão. Anúncios podem ser recusados, suspensos ou encerrados.",
      ],
      [
        "Organizações e revisão",
        "Cadastro e verificação de e-mail não tornam uma empresa verificada. Publicação depende de revisão humana. Edições materiais exigem nova aprovação. A verificação não substitui os cuidados do candidato.",
      ],
      [
        "Informações de terceiros",
        "As instituições de referência não são parceiras presumidas. Requisitos, prazos e condições devem ser confirmados na fonte.",
      ],
      [
        "Lançamento pendente",
        "A identificação do operador, o contato público, a jurisdição aplicável e os procedimentos de atendimento precisam ser preenchidos pelo proprietário após revisão.",
      ],
    ],
  },
  acessibilidade: {
    title: "Um caminho acessível.",
    intro:
      "A meta é WCAG 2.2 AA, com melhoria contínua e sem alegar certificação.",
    sections: [
      [
        "Navegação",
        "Há link para pular ao conteúdo, foco visível, formulários com rótulos, estrutura semântica e navegação por teclado. A interface se adapta a celulares e não depende de animações.",
      ],
      [
        "Limites atuais",
        "A auditoria com tecnologias assistivas e usuários ainda precisa ocorrer. Sites externos possuem suas próprias condições de acessibilidade.",
      ],
      [
        "Feedback",
        "O responsável precisa configurar um canal público para receber barreiras de acesso antes do lançamento.",
      ],
    ],
  },
  "guia-curriculo": {
    title: "Seu primeiro currículo, sem complicação.",
    intro:
      "Você tem mais para contar do que imagina. Comece com uma página simples.",
    sections: [
      [
        "Escolha o essencial",
        "Informe nome, município, e-mail profissional e um meio de contato que você se sinta seguro em compartilhar. Evite documentos, endereço exato e informações sensíveis.",
      ],
      [
        "Mostre o que já construiu",
        "Inclua escolaridade, cursos, projetos de escola, voluntariado e habilidades que consiga explicar. Não invente experiência.",
      ],
      [
        "Adapte e revise",
        "Leia os requisitos da vaga, destaque o que faz sentido e revise a escrita. Compartilhe o arquivo apenas pelo canal de candidatura confirmado.",
      ],
    ],
  },
  "guia-entrevista": {
    title: "Entrevista marcada? Vá com confiança.",
    intro:
      "Preparar-se ajuda a contar sua história com clareza. Não é preciso ter todas as respostas.",
    sections: [
      [
        "Antes da conversa",
        "Confira a empresa, o endereço ou link oficial e os requisitos. Separe exemplos de situações em que você aprendeu algo, ajudou alguém ou resolveu um problema.",
      ],
      [
        "Durante a entrevista",
        "Escute, peça esclarecimentos e responda com honestidade. Pergunte sobre atividades, horário, acompanhamento e etapas do processo.",
      ],
      [
        "Depois",
        "Anote dúvidas e prazos informados. Não pague taxas, não envie senhas e desconfie de solicitações de depósito.",
      ],
    ],
  },
  "guia-estudar": {
    title: "Aprender pode abrir um novo caminho.",
    intro:
      "Escolha uma habilidade de cada vez e consulte a oferta de cursos na fonte.",
    sections: [
      [
        "Confira as condições",
        "Gratuidade, materiais, requisitos e datas devem estar explícitos no edital ou página oficial. Não presuma que todos os cursos de uma instituição sejam gratuitos.",
      ],
      [
        "Crie um plano possível",
        "Reserve um tempo curto e consistente. Use exercícios e pequenos projetos para praticar o que aprendeu.",
      ],
      [
        "Guarde as evidências",
        "Certificados e projetos podem ajudar a mostrar sua evolução, sem prometer contratação garantida.",
      ],
    ],
  },
};
