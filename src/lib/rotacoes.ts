// Comparação das 3 rotações (exigência do desafio Field Shift).
// Regras: documento "GroundTruth — Metodologia e validação" — cada rotação recebe um NÍVEL por critério,
// sem nota única escondida; as prioridades do agricultor mudam a ORDEM e o destaque, não os números de risco.
//
// ⚠️ Textos agronômicos e níveis das prioridades são QUALITATIVOS e A VALIDAR COM TÉCNICO.
// Só o risco climático do milho vem de cálculo (motor + NASA POWER).

export type Prioridade = "agua" | "forragem" | "nitrogenio" | "erosao" | "materiaOrganica" | "mercado";

export const PRIORIDADES: { id: Prioridade; label: string }[] = [
  { id: "agua", label: "Água no solo" },
  { id: "forragem", label: "Forragem" },
  { id: "nitrogenio", label: "Nitrogênio" },
  { id: "erosao", label: "Menos erosão" },
  { id: "materiaOrganica", label: "Matéria orgânica" },
  { id: "mercado", label: "Mercado / renda" },
];

/** Quanto a rotação atende cada prioridade: 1 = pouco, 2 = médio, 3 = bem. Qualitativo, a validar. */
export type Atende = 1 | 2 | 3;

export interface Rotacao {
  id: "milho" | "trigo" | "milho-braquiaria";
  nome: string;
  rotulo: string;
  /** Usa o risco calculado do milho safrinha (geada e seca na fase crítica)? */
  riscoCalculado: boolean;
  /** Para rotações sem cálculo: texto do risco climático qualitativo. */
  riscoQualitativo?: string;
  /** Meses aproximados de solo descoberto entre safras (qualitativo). */
  soloDescoberto: string;
  /** Nível de erosão (Metodologia: solo coberto nos meses de chuva forte = Baixo). Qualitativo sem SRTM. */
  erosao: "Baixo" | "Médio" | "Alto";
  atende: Record<Prioridade, Atende>;
  justificativa: string;
  evidencia: string[];
  beneficios: string[];
  riscos: string[];
  lacunas: string[];
}

export const ROTACOES: Rotacao[] = [
  {
    id: "milho",
    nome: "Soja → milho safrinha",
    rotulo: "Atual",
    riscoCalculado: true,
    soloDescoberto: "Da colheita do milho (inverno) até a soja: solo pode ficar com pouca palha.",
    erosao: "Médio",
    atende: { agua: 1, forragem: 1, nitrogenio: 1, erosao: 1, materiaOrganica: 2, mercado: 3 },
    justificativa: "É o sistema mais comum na região: duas safras de grãos por ano na mesma área.",
    evidencia: [
      "Risco de geada e seca na fase crítica calculado com os dados diários da NASA POWER desde 1981.",
      "Deral (mai/2026): geadas queimaram folhas do milho safrinha em baixadas.",
    ],
    beneficios: ["Maior potencial de renda com grãos.", "Mercado e logística já conhecidos."],
    riscos: [
      "Geada no pendoamento e enchimento quando a soja é plantada tarde.",
      "Veranico com solo seco na fase crítica.",
      "Pouca cobertura do solo depois da colheita.",
    ],
    lacunas: ["Cultivar e ciclo reais do milho", "Adubação", "Preço do milho na época", "Janela do ZARC"],
  },
  {
    id: "trigo",
    nome: "Soja → trigo",
    rotulo: "Adaptação térmica",
    riscoCalculado: false,
    riscoQualitativo:
      "Não calculado no app (fase sensível do trigo é o espigamento, 70–110 dias). Deral (mai/2026): o trigo não teve dano significativo com as geadas que atingiram o milho.",
    soloDescoberto: "Cobertura no inverno; janela curta entre o trigo e a soja.",
    erosao: "Baixo",
    atende: { agua: 2, forragem: 2, nitrogenio: 1, erosao: 2, materiaOrganica: 2, mercado: 2 },
    justificativa:
      "Trocar o milho safrinha por um cereal de inverno onde a geada na fase crítica do milho é frequente (por exemplo, em baixadas).",
    evidencia: [
      "Deral (mai/2026): com as mesmas geadas, o trigo não teve dano significativo.",
      "O risco climático do trigo ainda não é calculado neste app.",
    ],
    beneficios: ["Tolera melhor o frio na fase vegetativa.", "Cobertura do solo no inverno.", "Quebra o ciclo de pragas do milho."],
    riscos: [
      "Geada no espigamento e chuva na colheita também causam perdas no trigo.",
      "Renda costuma ser menor e mais dependente de preço.",
    ],
    lacunas: ["Cultivar de trigo e época de semeadura (ZARC)", "Preço e liquidez do trigo", "Doenças no inverno úmido"],
  },
  {
    id: "milho-braquiaria",
    nome: "Soja → milho + braquiária",
    rotulo: "Solo e resiliência hídrica",
    riscoCalculado: true,
    soloDescoberto: "Braquiária mantém o solo coberto depois do milho até a dessecação para a soja.",
    erosao: "Baixo",
    atende: { agua: 3, forragem: 3, nitrogenio: 1, erosao: 3, materiaOrganica: 3, mercado: 2 },
    justificativa:
      "Semear braquiária junto com o milho safrinha para manter o solo coberto e formar palha para a próxima soja.",
    evidencia: [
      "O milho continua exposto ao mesmo risco de geada e seca calculado com a NASA POWER.",
      "Consórcio milho–braquiária é técnica difundida pela pesquisa agropecuária brasileira (a validar para a sua área).",
    ],
    beneficios: [
      "Mais palha e cobertura: menos erosão e menos perda de umidade.",
      "Raízes ajudam a estrutura do solo.",
      "Pode servir de pasto no inverno.",
    ],
    riscos: [
      "Mesmo risco climático do milho.",
      "Competição com o milho se o manejo falhar.",
      "Exige dessecação bem-feita antes da soja.",
    ],
    lacunas: ["Espécie e dose de semente da braquiária", "Manejo de herbicida", "Efeito real na produtividade da soja seguinte"],
  },
];

export const NOTA_NITROGENIO =
  "Nenhuma das 3 rotações inclui leguminosa de inverno; para nitrogênio, avaliar com o técnico uma opção como ervilhaca ou tremoço.";

export const REGRA_ORDEM =
  "Ordem: soma de quanto cada rotação atende às prioridades marcadas (1 = pouco, 3 = bem; qualitativo). " +
  "Empate: menor risco climático primeiro. As prioridades não mudam os números de risco. " +
  "Nível de risco (Metodologia): Baixo até 1 em 10 anos, Médio 2 ou 3, Alto 4 ou mais.";
