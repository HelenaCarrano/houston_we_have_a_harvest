// Motor de cálculo do GroundTruth: funções puras, sem React.
// Entrada: série diária da NASA POWER (src/data/power_daily_<id>.json).

import { DATAS_SOJA_PADRAO, PARAMS_PADRAO, type EngineParams } from "./params.ts";

export { DATAS_SOJA_PADRAO, PARAMS_PADRAO, type EngineParams };

const DIA_MS = 86_400_000;

export type Serie = (number | null)[];

export interface DadosDiarios {
  meta: { start: string; end: string; [k: string]: unknown };
  data: {
    T2M_MIN: Serie;
    T2M_MAX: Serie;
    PRECTOTCORR: Serie;
    GWETROOT: Serie;
    GWETTOP: Serie;
  };
}

export interface Cronograma {
  plantioSoja: Date;
  colheitaSoja: Date;
  plantioMilho: Date;
  floracaoMilho: Date;
  janelaInicio: Date;
  janelaFim: Date;
}

export interface AnoAvaliado {
  /** Ano da safrinha (ano em que o milho floresce). */
  ano: number;
  evento: boolean;
  /** Geada: menor T2M_MIN na janela. Seca: maior sequência de dias secos. */
  valor: number;
  /** Seca: GWETROOT médio no período. */
  umidadeSoloMedia?: number;
}

export interface ResultadoRisco {
  anosComEvento: number;
  totalAnos: number;
  /** 0–1 */
  frequencia: number;
  /** Anos (safrinha) em que o evento ocorreu. */
  anosListados: number[];
  /** Detalhe de cada ano avaliado. */
  porAno: AnoAvaliado[];
  /** Primeiro e último ano avaliados. */
  periodo: [number, number] | null;
}

// ---------- datas ----------

function utc(ano: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function somaDias(d: Date, dias: number): Date {
  return new Date(d.getTime() + dias * DIA_MS);
}

/** Converte "MM-DD" (ou Date) para a data de plantio da soja no ano informado. */
function dataSojaNoAno(dataSoja: string | Date, ano: number): Date {
  if (dataSoja instanceof Date) return utc(ano, dataSoja.getUTCMonth() + 1, dataSoja.getUTCDate());
  const [mes, dia] = dataSoja.split("-").map(Number);
  return utc(ano, mes, dia);
}

/** Índice do dia `d` na série que começa em `inicio`. */
function indice(inicio: Date, d: Date): number {
  return Math.round((d.getTime() - inicio.getTime()) / DIA_MS);
}

function inicioSerie(dados: DadosDiarios): Date {
  return new Date(`${dados.meta.start}T00:00:00Z`);
}

function fatia(serie: Serie, inicio: Date, de: Date, ate: Date): Serie | null {
  const a = indice(inicio, de);
  const b = indice(inicio, ate);
  if (a < 0 || b >= serie.length) return null; // fora do período com dados
  return serie.slice(a, b + 1);
}

// ---------- funções públicas ----------

/** Cronograma soja → milho safrinha a partir da data de plantio da soja. */
export function cronograma(dataSoja: Date, params: EngineParams = PARAMS_PADRAO): Cronograma {
  const colheitaSoja = somaDias(dataSoja, params.cicloSoja);
  const plantioMilho = somaDias(colheitaSoja, params.intervalo);
  const floracaoMilho = somaDias(plantioMilho, params.diasAteFlorescer);
  return {
    plantioSoja: dataSoja,
    colheitaSoja,
    plantioMilho,
    floracaoMilho,
    janelaInicio: somaDias(floracaoMilho, -params.janelaFloracaoDias),
    janelaFim: somaDias(floracaoMilho, params.janelaFloracaoDias),
  };
}

function anosDePlantio(dados: DadosDiarios): number[] {
  const ini = new Date(`${dados.meta.start}T00:00:00Z`).getUTCFullYear();
  const fim = new Date(`${dados.meta.end}T00:00:00Z`).getUTCFullYear();
  const anos: number[] = [];
  for (let a = ini; a <= fim; a++) anos.push(a);
  return anos;
}

function resumo(porAno: AnoAvaliado[]): ResultadoRisco {
  const anosListados = porAno.filter((a) => a.evento).map((a) => a.ano);
  return {
    anosComEvento: anosListados.length,
    totalAnos: porAno.length,
    frequencia: porAno.length ? anosListados.length / porAno.length : 0,
    anosListados,
    porAno,
    periodo: porAno.length ? [porAno[0].ano, porAno[porAno.length - 1].ano] : null,
  };
}

/**
 * Risco de geada na floração do milho safrinha: em cada ano, verifica se T2M_MIN <= limiteGeadaC
 * em algum dia de [floração - janela, floração + janela]. Só conta anos com a janela completa nos dados.
 */
export function riscoGeada(
  dados: DadosDiarios,
  dataSoja: string | Date,
  params: EngineParams = PARAMS_PADRAO,
): ResultadoRisco {
  const inicio = inicioSerie(dados);
  const porAno: AnoAvaliado[] = [];
  for (const anoPlantio of anosDePlantio(dados)) {
    const c = cronograma(dataSojaNoAno(dataSoja, anoPlantio), params);
    const t = fatia(dados.data.T2M_MIN, inicio, c.janelaInicio, c.janelaFim);
    if (!t || t.some((v) => v === null)) continue;
    const min = Math.min(...(t as number[]));
    porAno.push({ ano: c.floracaoMilho.getUTCFullYear(), evento: min <= params.limiteGeadaC, valor: min });
  }
  return resumo(porAno);
}

function maiorSequencia(chuva: number[], limite: number): number {
  let max = 0;
  let atual = 0;
  for (const v of chuva) {
    atual = v < limite ? atual + 1 : 0;
    if (atual > max) max = atual;
  }
  return max;
}

/** Percentil (0–100) por interpolação linear. */
export function percentil(valores: number[], p: number): number {
  if (!valores.length) return NaN;
  const ord = [...valores].sort((a, b) => a - b);
  const pos = (p / 100) * (ord.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return ord[lo] + (ord[hi] - ord[lo]) * (pos - lo);
}

/**
 * Risco de seca no início do milho safrinha: nos primeiros `diasSecaInicio` dias após o plantio do milho,
 * calcula a maior sequência de dias com PRECTOTCORR < chuvaDiaSecoMm e o GWETROOT médio.
 * Ano seco se sequência >= sequenciaSecaDias OU GWETROOT médio abaixo do percentil histórico
 * (calculado com todos os anos avaliados para esta mesma data).
 */
export function riscoSeca(
  dados: DadosDiarios,
  dataSoja: string | Date,
  params: EngineParams = PARAMS_PADRAO,
  /** Limite fixo de GWETROOT. Se omitido, usa o percentil dos anos desta mesma data. */
  limiteUmidadeFixo?: number,
): ResultadoRisco {
  const brutos = secaBrutos(dados, dataSoja, params);
  const limiteUmidade =
    limiteUmidadeFixo ??
    percentil(
      brutos.map((b) => b.umidade),
      params.percentilUmidadeSolo,
    );
  const porAno: AnoAvaliado[] = brutos.map((b) => ({
    ano: b.ano,
    evento: b.seq >= params.sequenciaSecaDias || b.umidade < limiteUmidade,
    valor: b.seq,
    umidadeSoloMedia: Math.round(b.umidade * 1000) / 1000,
  }));
  return resumo(porAno);
}

/**
 * Limite de GWETROOT comum a várias datas: percentil do GWETROOT médio de todos os anos
 * e de todas as datas juntas. Assim a frequência de seca pode variar entre datas
 * (com o percentil por data, ela seria ~20% em qualquer data, por construção).
 */
export function limiteUmidadeComum(
  dados: DadosDiarios,
  datas: readonly string[],
  params: EngineParams = PARAMS_PADRAO,
): number {
  const todos = datas.flatMap((d) => secaBrutos(dados, d, params).map((b) => b.umidade));
  return percentil(todos, params.percentilUmidadeSolo);
}

function secaBrutos(dados: DadosDiarios, dataSoja: string | Date, params: EngineParams) {
  const inicio = inicioSerie(dados);
  const brutos: { ano: number; seq: number; umidade: number }[] = [];
  for (const anoPlantio of anosDePlantio(dados)) {
    const c = cronograma(dataSojaNoAno(dataSoja, anoPlantio), params);
    const fim = somaDias(c.plantioMilho, params.diasSecaInicio - 1);
    const chuva = fatia(dados.data.PRECTOTCORR, inicio, c.plantioMilho, fim);
    const solo = fatia(dados.data.GWETROOT, inicio, c.plantioMilho, fim);
    if (!chuva || !solo || chuva.some((v) => v === null) || solo.some((v) => v === null)) continue;
    const s = solo as number[];
    brutos.push({
      ano: c.plantioMilho.getUTCFullYear(),
      seq: maiorSequencia(chuva as number[], params.chuvaDiaSecoMm),
      umidade: s.reduce((a, b) => a + b, 0) / s.length,
    });
  }
  return brutos;
}

export interface RiscoData {
  dataSoja: string;
  /** Cronograma de referência (ano de plantio informado). */
  cronograma: Cronograma;
  geada: ResultadoRisco;
  seca: ResultadoRisco;
}

/** Calcula geada e seca para várias datas de plantio da soja ("MM-DD"). */
export function riscoPorData(
  dados: DadosDiarios,
  params: EngineParams = PARAMS_PADRAO,
  datas: readonly string[] = DATAS_SOJA_PADRAO,
  anoReferencia: number = new Date().getUTCFullYear(),
): RiscoData[] {
  const limite = limiteUmidadeComum(dados, datas, params);
  return datas.map((d) => ({
    dataSoja: d,
    cronograma: cronograma(dataSojaNoAno(d, anoReferencia), params),
    geada: riscoGeada(dados, d, params),
    seca: riscoSeca(dados, d, params, limite),
  }));
}

export type Confianca = "alta" | "média" | "baixa";

/** Confiança pelo número de anos avaliados: alta (>= 25), média (12–24), baixa (< 12). */
export function confianca(totalAnos: number): Confianca {
  if (totalAnos >= 25) return "alta";
  if (totalAnos >= 12) return "média";
  return "baixa";
}

/** "X de cada 10 anos", arredondado. */
export function deCada10(frequencia: number): number {
  return Math.round(frequencia * 10);
}

/** Aviso qualitativo para lavouras em baixada (não multiplica números sem base). */
export const AVISO_BAIXADA =
  "Baixadas acumulam ar frio; o risco local tende a ser maior que o calculado para a região.";
