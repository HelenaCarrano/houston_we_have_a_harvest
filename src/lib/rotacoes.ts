// Comparação das 3 rotações (exigência do desafio Field Shift).
//
// ⚠️ Os textos agronômicos e as notas de renda/solo são QUALITATIVOS e A VALIDAR COM TÉCNICO.
// Só o risco climático do milho vem de cálculo (motor + NASA POWER).

export type Prioridade = "renda" | "risco" | "solo";

export interface Rotacao {
  id: "milho" | "trigo" | "milho-braquiaria";
  nome: string;
  rotulo: string;
  /** Usa o risco calculado do milho safrinha (geada na floração + seca no início)? */
  riscoCalculado: boolean;
  justificativa: string;
  evidencia: string[];
  beneficios: string[];
  riscos: string[];
  lacunas: string[];
  /** Notas qualitativas 1–3 (3 = melhor). A validar. */
  notaRenda: 1 | 2 | 3;
  notaSolo: 1 | 2 | 3;
  /** Só para rotações sem risco calculado. */
  notaRiscoQualitativa?: 1 | 2 | 3;
  notaRiscoTexto?: string;
}

export const ROTACOES: Rotacao[] = [
  {
    id: "milho",
    nome: "Soja → milho safrinha",
    rotulo: "Atual",
    riscoCalculado: true,
    justificativa: "É o sistema mais comum na região: duas safras de grãos por ano na mesma área.",
    evidencia: [
      "Risco de geada na floração e de seca no início calculados com 35 anos de dados diários da NASA POWER.",
      "Deral (mai/2026): geadas queimaram folhas do milho safrinha em baixadas.",
    ],
    beneficios: ["Maior potencial de renda com grãos.", "Mercado e logística já conhecidos."],
    riscos: [
      "Geada na floração quando a soja é plantada tarde.",
      "Seca no início do milho.",
      "Pouca palha se a área ficar descoberta depois da colheita.",
    ],
    lacunas: ["Cultivar e ciclo reais do milho", "Adubação", "Preço do milho na época", "Janela do ZARC"],
    notaRenda: 3,
    notaSolo: 1,
  },
  {
    id: "trigo",
    nome: "Soja → trigo",
    rotulo: "Adaptação térmica",
    riscoCalculado: false,
    justificativa:
      "Trocar o milho safrinha por um cereal de inverno onde a geada na floração do milho é frequente (por exemplo, em baixadas).",
    evidencia: [
      "Deral (mai/2026): com as mesmas geadas que atingiram o milho safrinha, o trigo não teve dano significativo.",
      "O risco climático do trigo não é calculado neste app (o ciclo e a fase sensível são outros).",
    ],
    beneficios: ["Tolera melhor o frio na fase vegetativa.", "Cobertura do solo no inverno.", "Quebra o ciclo de pragas do milho."],
    riscos: [
      "Geada no espigamento e chuva na colheita também causam perdas no trigo.",
      "Renda costuma ser menor e mais dependente de preço.",
    ],
    lacunas: ["Cultivar de trigo e época de semeadura (ZARC)", "Preço e liquidez do trigo", "Risco de doenças no inverno úmido"],
    notaRenda: 2,
    notaSolo: 2,
    notaRiscoQualitativa: 2,
    notaRiscoTexto: "Estimativa qualitativa (não calculada): menos sensível à geada de maio que o milho, segundo o Deral 2026.",
  },
  {
    id: "milho-braquiaria",
    nome: "Soja → milho + braquiária",
    rotulo: "Solo e resiliência hídrica",
    riscoCalculado: true,
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
    notaRenda: 2,
    notaSolo: 3,
  },
];

/** Nota de risco 1–3 a partir da frequência de anos com geada OU seca. */
export function notaRiscoPorFrequencia(freq: number): 1 | 2 | 3 {
  if (freq < 0.1) return 3;
  if (freq <= 0.25) return 2;
  return 1;
}

export const PESOS: Record<Prioridade, Record<Prioridade, number>> = {
  renda: { renda: 2, risco: 1, solo: 1 },
  risco: { renda: 1, risco: 2, solo: 1 },
  solo: { renda: 1, risco: 1, solo: 2 },
};

export const REGRA_PONTUACAO =
  "Cada rotação recebe nota de 1 a 3 em renda, risco climático e solo (3 = melhor). " +
  "A prioridade escolhida vale peso 2; as outras, peso 1. Pontuação = soma das notas × pesos (máx. 12). " +
  "Risco do milho: 3 se geada ou seca em menos de 10% dos anos, 2 se entre 10% e 25%, 1 se acima de 25%.";
