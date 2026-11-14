// Comparação das 3 rotações (exigência do desafio Field Shift).
// Regras: documento "GroundTruth — Metodologia e validação" — cada rotação recebe um NÍVEL por critério,
// sem nota única escondida; as prioridades do agricultor mudam a ORDEM e o destaque, não os números de risco.
//
// ⚠️ Textos agronômicos e níveis das prioridades são QUALITATIVOS e A VALIDAR COM TÉCNICO.
// Só o risco climático do milho vem de cálculo (motor + NASA POWER).
// Todos os textos existem em português (pt) e inglês (en).

export type Prioridade = "agua" | "forragem" | "nitrogenio" | "erosao" | "materiaOrganica" | "mercado";

export const PRIORIDADES: { id: Prioridade; pt: string; en: string }[] = [
  { id: "agua", pt: "Água no solo", en: "Soil water" },
  { id: "forragem", pt: "Forragem", en: "Forage" },
  { id: "nitrogenio", pt: "Nitrogênio", en: "Nitrogen" },
  { id: "erosao", pt: "Menos erosão", en: "Less erosion" },
  { id: "materiaOrganica", pt: "Matéria orgânica", en: "Organic matter" },
  { id: "mercado", pt: "Mercado / renda", en: "Market / income" },
];

/** Quanto a rotação atende cada prioridade: 1 = pouco, 2 = médio, 3 = bem. Qualitativo, a validar. */
export type Atende = 1 | 2 | 3;

export interface TextosRotacao {
  nome: string;
  rotulo: string;
  /** Para rotações sem cálculo: texto do risco climático qualitativo. */
  riscoQualitativo?: string;
  soloDescoberto: string;
  justificativa: string;
  evidencia: string[];
  beneficios: string[];
  riscos: string[];
  lacunas: string[];
}

export interface Rotacao {
  id: "milho" | "trigo" | "milho-braquiaria";
  /** Usa o risco calculado do milho safrinha (geada e seca na fase crítica)? */
  riscoCalculado: boolean;
  /** Nível de erosão (qualitativo, sem classificação por talhão). */
  erosao: "Baixo" | "Médio" | "Alto";
  atende: Record<Prioridade, Atende>;
  pt: TextosRotacao;
  en: TextosRotacao;
}

export const ROTACOES: Rotacao[] = [
  {
    id: "milho",
    riscoCalculado: true,
    erosao: "Médio",
    atende: { agua: 1, forragem: 1, nitrogenio: 1, erosao: 1, materiaOrganica: 2, mercado: 3 },
    pt: {
      nome: "Soja → milho safrinha",
      rotulo: "Atual",
      soloDescoberto: "Da colheita do milho (inverno) até a soja: solo pode ficar com pouca palha.",
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
    en: {
      nome: "Soybean → second-crop corn",
      rotulo: "Current",
      soloDescoberto: "From the corn harvest (winter) until soybean: the soil may be left with little straw.",
      justificativa: "The most common system in the region: two grain crops a year on the same field.",
      evidencia: [
        "Frost and drought risk in the critical stage computed from NASA POWER daily data since 1981.",
        "Deral (May 2026): frosts burned second-crop corn leaves in lowlands.",
      ],
      beneficios: ["Highest income potential from grain.", "Market and logistics already known."],
      riscos: [
        "Frost at tasseling and grain fill when soybean is planted late.",
        "Dry spell with dry soil in the critical stage.",
        "Little soil cover after harvest.",
      ],
      lacunas: ["Actual corn cultivar and cycle", "Fertilization", "Corn price at the time", "ZARC planting window"],
    },
  },
  {
    id: "trigo",
    riscoCalculado: false,
    erosao: "Baixo",
    atende: { agua: 2, forragem: 2, nitrogenio: 1, erosao: 2, materiaOrganica: 2, mercado: 2 },
    pt: {
      nome: "Soja → trigo",
      rotulo: "Adaptação térmica",
      riscoQualitativo:
        "Não calculado no app (fase sensível do trigo é o espigamento, 70–110 dias). Deral (mai/2026): o trigo não teve dano significativo com as geadas que atingiram o milho.",
      soloDescoberto: "Cobertura no inverno; janela curta entre o trigo e a soja.",
      justificativa:
        "Trocar o milho safrinha por um cereal de inverno onde a geada na fase crítica do milho é frequente (por exemplo, em baixadas).",
      evidencia: [
        "Deral (mai/2026): com as mesmas geadas, o trigo não teve dano significativo.",
        "O risco climático do trigo ainda não é calculado neste app.",
      ],
      beneficios: [
        "Tolera melhor o frio na fase vegetativa.",
        "Cobertura do solo no inverno.",
        "Quebra o ciclo de pragas do milho.",
      ],
      riscos: [
        "Geada no espigamento e chuva na colheita também causam perdas no trigo.",
        "Renda costuma ser menor e mais dependente de preço.",
      ],
      lacunas: ["Cultivar de trigo e época de semeadura (ZARC)", "Preço e liquidez do trigo", "Doenças no inverno úmido"],
    },
    en: {
      nome: "Soybean → wheat",
      rotulo: "Thermal adaptation",
      riscoQualitativo:
        "Not computed in the app (wheat's sensitive stage is heading, 70–110 days). Deral (May 2026): wheat had no significant damage from the frosts that hit corn.",
      soloDescoberto: "Winter cover; short window between wheat and soybean.",
      justificativa:
        "Replace second-crop corn with a winter cereal where frost in corn's critical stage is frequent (for example, in lowlands).",
      evidencia: [
        "Deral (May 2026): with the same frosts, wheat had no significant damage.",
        "Wheat's climate risk is not yet computed in this app.",
      ],
      beneficios: [
        "Tolerates cold better in the vegetative stage.",
        "Winter soil cover.",
        "Breaks the corn pest cycle.",
      ],
      riscos: [
        "Frost at heading and rain at harvest also cause wheat losses.",
        "Income is usually lower and more price-dependent.",
      ],
      lacunas: ["Wheat cultivar and sowing date (ZARC)", "Wheat price and liquidity", "Diseases in a wet winter"],
    },
  },
  {
    id: "milho-braquiaria",
    riscoCalculado: true,
    erosao: "Baixo",
    atende: { agua: 3, forragem: 3, nitrogenio: 1, erosao: 3, materiaOrganica: 3, mercado: 2 },
    pt: {
      nome: "Soja → milho + braquiária",
      rotulo: "Solo e resiliência hídrica",
      soloDescoberto: "Braquiária mantém o solo coberto depois do milho até a dessecação para a soja.",
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
      lacunas: [
        "Espécie e dose de semente da braquiária",
        "Manejo de herbicida",
        "Efeito real na produtividade da soja seguinte",
      ],
    },
    en: {
      nome: "Soybean → corn + brachiaria",
      rotulo: "Soil and water resilience",
      soloDescoberto: "Brachiaria keeps the soil covered after corn until it is desiccated before soybean.",
      justificativa:
        "Sow brachiaria (a tropical forage grass) together with second-crop corn to keep the soil covered and build straw for the next soybean.",
      evidencia: [
        "Corn is still exposed to the same frost and drought risk computed from NASA POWER.",
        "Corn–brachiaria intercropping is a technique widely promoted by Brazilian agricultural research (to be validated for your area).",
      ],
      beneficios: [
        "More straw and cover: less erosion and less moisture loss.",
        "Roots help soil structure.",
        "Can serve as winter pasture.",
      ],
      riscos: [
        "Same climate risk as corn.",
        "Competition with corn if management fails.",
        "Requires well-done desiccation before soybean.",
      ],
      lacunas: [
        "Brachiaria species and seed rate",
        "Herbicide management",
        "Real effect on the following soybean yield",
      ],
    },
  },
];

export const NOTA_NITROGENIO = {
  pt: "Nenhuma das 3 rotações inclui leguminosa de inverno; para nitrogênio, avaliar com o técnico uma opção como ervilhaca ou tremoço.",
  en: "None of the 3 rotations includes a winter legume; for nitrogen, discuss an option such as vetch or lupin with the technician.",
};

export const REGRA_ORDEM = {
  pt:
    "Ordem: soma de quanto cada rotação atende às prioridades marcadas (1 = pouco, 3 = bem; qualitativo). " +
    "Empate: menor risco climático primeiro. As prioridades não mudam os números de risco. " +
    "Nível de risco (Metodologia): Baixo até 1 em 10 anos, Médio 2 ou 3, Alto 4 ou mais.",
  en:
    "Order: sum of how well each rotation meets the ticked priorities (1 = little, 3 = well; qualitative). " +
    "Ties: lower climate risk first. Priorities never change the risk numbers. " +
    "Risk level (methodology): Low up to 1 in 10 years, Medium 2 or 3, High 4 or more.",
};
