// Avaliação da previsão de 16 dias (Open-Meteo) para o plantio da soja: funções puras, sem React.
//
// ⚠️ Os limites abaixo são HIPÓTESES a validar com agronomia. Previsão não é garantia: depois de ~7 dias
// a incerteza cresce muito. Isto apoia a conversa com o técnico; não substitui o ZARC nem o vazio sanitário.

export interface PrevisaoDiaria {
  time: string[]; // "YYYY-MM-DD"
  temperature_2m_min: (number | null)[];
  temperature_2m_max: (number | null)[];
  precipitation_sum: (number | null)[];
}

export interface ParamsPrevisao {
  /** Quantos dias à frente contam como "esta semana". */
  diasSemana: number;
  /** Mínima do ar a 2 m <= este valor = risco de geada sobre a soja recém-emergida. */
  limiteGeadaC: number;
  /** Chuva diária igual ou acima disto (mm) = campo encharcado / erosão (valor citado na Metodologia). */
  chuvaForteMm: number;
  /** Chuva total da semana abaixo disto (mm) = pouca umidade para a soja germinar. */
  chuvaMinSemanaMm: number;
}

export const PARAMS_PREVISAO: ParamsPrevisao = {
  diasSemana: 7,
  limiteGeadaC: 3,
  chuvaForteMm: 50,
  chuvaMinSemanaMm: 10,
};

export type NivelAlerta = "nao-plantar" | "atencao" | "sem-alerta";

export interface EventoPrevisao {
  tipo: "geada" | "chuva-forte";
  /** "YYYY-MM-DD" */
  data: string;
  valor: number;
  /** Índice do dia (0 = hoje). */
  dia: number;
}

export interface AvaliacaoPrevisao {
  nivel: NivelAlerta;
  titulo: string;
  mensagens: string[];
  eventos: EventoPrevisao[];
  chuvaSemanaMm: number | null;
  diasAvaliados: number;
}

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/**
 * Regras (hipóteses a validar):
 *  - geada (mínima <= limite) ou chuva forte (>= chuvaForteMm) nos primeiros `diasSemana` dias → "Não plante esta semana";
 *  - semana com chuva total < chuvaMinSemanaMm → "Atenção" (pouca umidade);
 *  - os mesmos eventos depois da primeira semana → "Atenção" (acompanhe, a previsão ainda muda).
 * Em baixada, o limite de geada sobe `ajusteBaixadaC`.
 */
export function avaliarPrevisao(
  p: PrevisaoDiaria,
  params: ParamsPrevisao = PARAMS_PREVISAO,
  ajusteBaixadaC = 0,
): AvaliacaoPrevisao {
  const n = Math.min(p.time.length, p.temperature_2m_min.length, p.precipitation_sum.length);
  const limite = params.limiteGeadaC + ajusteBaixadaC;
  const eventos: EventoPrevisao[] = [];
  let chuvaSemana = 0;
  let diasComChuva = 0;

  for (let i = 0; i < n; i++) {
    const tmin = p.temperature_2m_min[i];
    const chuva = p.precipitation_sum[i];
    if (tmin !== null && tmin <= limite) eventos.push({ tipo: "geada", data: p.time[i], valor: tmin, dia: i });
    if (chuva !== null && chuva >= params.chuvaForteMm)
      eventos.push({ tipo: "chuva-forte", data: p.time[i], valor: chuva, dia: i });
    if (i < params.diasSemana && chuva !== null) {
      chuvaSemana += chuva;
      diasComChuva++;
    }
  }

  const naSemana = eventos.filter((e) => e.dia < params.diasSemana);
  const depois = eventos.filter((e) => e.dia >= params.diasSemana);
  const semanaSeca = diasComChuva >= params.diasSemana && chuvaSemana < params.chuvaMinSemanaMm;
  const txt = (e: EventoPrevisao) =>
    e.tipo === "geada"
      ? `geada prevista em ${ddmm(e.data)} (mínima ${e.valor.toLocaleString("pt-BR")} °C, limite ${limite} °C)`
      : `chuva forte em ${ddmm(e.data)} (${e.valor.toLocaleString("pt-BR")} mm)`;

  const mensagens: string[] = [];
  naSemana.forEach((e) => mensagens.push(`Nesta semana: ${txt(e)}.`));
  if (semanaSeca)
    mensagens.push(
      `Semana seca: ${chuvaSemana.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mm previstos em ${params.diasSemana} dias (abaixo de ${params.chuvaMinSemanaMm} mm). Pouca umidade para a soja germinar.`,
    );
  depois.forEach((e) => mensagens.push(`Mais adiante: ${txt(e)}. A previsão ainda pode mudar.`));

  let nivel: NivelAlerta = "sem-alerta";
  let titulo = `Sem alerta nos próximos ${params.diasSemana} dias`;
  if (naSemana.length > 0) {
    nivel = "nao-plantar";
    titulo = "Não plante esta semana";
  } else if (semanaSeca || depois.length > 0) {
    nivel = "atencao";
    titulo = semanaSeca ? "Atenção: semana seca" : "Atenção nas próximas semanas";
  }
  if (mensagens.length === 0) mensagens.push("Nenhum dos eventos monitorados aparece na previsão.");

  return {
    nivel,
    titulo,
    mensagens,
    eventos,
    chuvaSemanaMm: diasComChuva ? Math.round(chuvaSemana * 10) / 10 : null,
    diasAvaliados: n,
  };
}
