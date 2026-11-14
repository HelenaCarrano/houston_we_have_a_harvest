// Motor de cálculo do GroundTruth: funções puras, sem React.
// Entrada: série diária da NASA POWER (src/data/power_daily_<id>.json).
// Regras: documento "GroundTruth — Metodologia e validação".

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
  /** Fase crítica do milho (pendoamento e enchimento). */
  faseInicio: Date;
  faseFim: Date;
}

export interface AnoAvaliado {
  /** Ano da safrinha (ano em que o milho está na fase crítica). */
  ano: number;
  evento: boolean;
  /** Geada: menor T2M_MIN na fase. Seca: maior sequência de dias secos. */
  valor: number;
  /** Geada forte (só no risco de geada). */
  forte?: boolean;
  /** Seca: GWETROOT médio na fase. */
  umidadeSoloMedia?: number;
}

export interface ResultadoRisco {
  anosComEvento: number;
  totalAnos: number;
  /** 0–1 */
  frequencia: number;
  /** Anos (safrinha) em que o evento ocorreu. */
  anosListados: number[];
  /** Só geada: anos com geada forte. */
  anosFortes?: number[];
  porAno: AnoAvaliado[];
  periodo: [number, number] | null;
}

// ---------- datas ----------

function utc(ano: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function somaDias(d: Date, dias: number): Date {
  return new Date(d.getTime() + dias * DIA_MS);
}

function dataSojaNoAno(dataSoja: string | Date, ano: number): Date {
  if (dataSoja instanceof Date) return utc(ano, dataSoja.getUTCMonth() + 1, dataSoja.getUTCDate());
  const [mes, dia] = dataSoja.split("-").map(Number);
  return utc(ano, mes, dia);
}

function indice(inicio: Date, d: Date): number {
  return Math.round((d.getTime() - inicio.getTime()) / DIA_MS);
}

function inicioSerie(dados: DadosDiarios): Date {
  return new Date(`${dados.meta.start}T00:00:00Z`);
}

function fatia(serie: Serie, inicio: Date, de: Date, ate: Date): Serie | null {
  const a = indice(inicio, de);
  const b = indice(inicio, ate);
  if (a < 0 || b >= serie.length) return null;
  return serie.slice(a, b + 1);
}

const completa = (s: Serie | null): s is number[] => !!s && s.every((v) => v !== null);

// ---------- funções públicas ----------

/** Cronograma soja → milho safrinha a partir da data de plantio da soja. */
export function cronograma(dataSoja: Date, params: EngineParams = PARAMS_PADRAO): Cronograma {
  const colheitaSoja = somaDias(dataSoja, params.cicloSoja);
  const plantioMilho = somaDias(colheitaSoja, params.intervalo);
  return {
    plantioSoja: dataSoja,
    colheitaSoja,
    plantioMilho,
    floracaoMilho: somaDias(plantioMilho, params.diasAteFlorescer),
    faseInicio: somaDias(plantioMilho, params.faseCriticaInicio),
    faseFim: somaDias(plantioMilho, params.faseCriticaFim),
  };
}

function anosDePlantio(dados: DadosDiarios): number[] {
  const ini = new Date(`${dados.meta.start}T00:00:00Z`).getUTCFullYear();
  const fim = new Date(`${dados.meta.end}T00:00:00Z`).getUTCFullYear();
  const anos: number[] = [];
  for (let a = ini; a <= fim; a++) anos.push(a);
  return anos;
}

function resumo(porAno: AnoAvaliado[], comFortes = false): ResultadoRisco {
  const anosListados = porAno.filter((a) => a.evento).map((a) => a.ano);
  return {
    anosComEvento: anosListados.length,
    totalAnos: porAno.length,
    frequencia: porAno.length ? anosListados.length / porAno.length : 0,
    anosListados,
    ...(comFortes ? { anosFortes: porAno.filter((a) => a.forte).map((a) => a.ano) } : {}),
    porAno,
    periodo: porAno.length ? [porAno[0].ano, porAno[porAno.length - 1].ano] : null,
  };
}

/**
 * Geada na fase crítica do milho safrinha: em cada ano, verifica se T2M_MIN <= limite em algum dia
 * de [plantio do milho + faseCriticaInicio, plantio do milho + faseCriticaFim].
 * `baixada` sobe o limite em `ajusteBaixadaC` (ar frio acumulado; hipótese a calibrar).
 */
export function riscoGeada(
  dados: DadosDiarios,
  dataSoja: string | Date,
  params: EngineParams = PARAMS_PADRAO,
  baixada = false,
): ResultadoRisco {
  const inicio = inicioSerie(dados);
  const ajuste = baixada ? params.ajusteBaixadaC : 0;
  const limite = params.limiteGeadaC + ajuste;
  const limiteForte = params.limiteGeadaForteC + ajuste;
  const porAno: AnoAvaliado[] = [];
  for (const anoPlantio of anosDePlantio(dados)) {
    const c = cronograma(dataSojaNoAno(dataSoja, anoPlantio), params);
    const t = fatia(dados.data.T2M_MIN, inicio, c.faseInicio, c.faseFim);
    if (!completa(t)) continue;
    const min = Math.min(...t);
    porAno.push({ ano: c.faseInicio.getUTCFullYear(), evento: min <= limite, forte: min <= limiteForte, valor: min });
  }
  return resumo(porAno, true);
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
 * Seca na fase crítica do milho safrinha. Um ano é seco quando AS DUAS condições valem na fase:
 *  - veranico: sequência >= sequenciaSecaDias com chuva < chuvaDiaSecoMm; E
 *  - GWETROOT médio abaixo do percentil `percentilUmidadeSolo` da própria série
 *    para as mesmas datas do ano (todos os anos avaliados nesta mesma janela).
 */
export function riscoSeca(
  dados: DadosDiarios,
  dataSoja: string | Date,
  params: EngineParams = PARAMS_PADRAO,
): ResultadoRisco {
  const inicio = inicioSerie(dados);
  const brutos: { ano: number; seq: number; umidade: number }[] = [];
  for (const anoPlantio of anosDePlantio(dados)) {
    const c = cronograma(dataSojaNoAno(dataSoja, anoPlantio), params);
    const chuva = fatia(dados.data.PRECTOTCORR, inicio, c.faseInicio, c.faseFim);
    const solo = fatia(dados.data.GWETROOT, inicio, c.faseInicio, c.faseFim);
    if (!completa(chuva) || !completa(solo)) continue;
    brutos.push({
      ano: c.faseInicio.getUTCFullYear(),
      seq: maiorSequencia(chuva, params.chuvaDiaSecoMm),
      umidade: solo.reduce((a, b) => a + b, 0) / solo.length,
    });
  }
  const limiteUmidade = percentil(
    brutos.map((b) => b.umidade),
    params.percentilUmidadeSolo,
  );
  const porAno: AnoAvaliado[] = brutos.map((b) => ({
    ano: b.ano,
    evento: b.seq >= params.sequenciaSecaDias && b.umidade < limiteUmidade,
    valor: b.seq,
    umidadeSoloMedia: Math.round(b.umidade * 1000) / 1000,
  }));
  return resumo(porAno);
}

export interface RiscoData {
  dataSoja: string;
  cronograma: Cronograma;
  geada: ResultadoRisco;
  /** Mesmo cálculo com o limite de baixada (+ajusteBaixadaC). */
  geadaBaixada: ResultadoRisco;
  seca: ResultadoRisco;
}

/** Calcula geada (normal e baixada) e seca para várias datas de plantio da soja ("MM-DD"). */
export function riscoPorData(
  dados: DadosDiarios,
  params: EngineParams = PARAMS_PADRAO,
  datas: readonly string[] = DATAS_SOJA_PADRAO,
  anoReferencia: number = new Date().getUTCFullYear(),
): RiscoData[] {
  return datas.map((d) => ({
    dataSoja: d,
    cronograma: cronograma(dataSojaNoAno(d, anoReferencia), params),
    geada: riscoGeada(dados, d, params),
    geadaBaixada: riscoGeada(dados, d, params, true),
    seca: riscoSeca(dados, d, params),
  }));
}

export type Confianca = "alta" | "média" | "baixa";

/**
 * Confiança pelo número de anos usados (Metodologia): alta (>= 12), média (7–11), baixa (< 7).
 * A Metodologia também exige concordância com Deral/IBGE para "alta"; essa validação ainda não está no app.
 */
export function confianca(totalAnos: number): Confianca {
  if (totalAnos >= 12) return "alta";
  if (totalAnos >= 7) return "média";
  return "baixa";
}

export type Nivel = "Baixo" | "Médio" | "Alto";

/** Nível de risco (Metodologia): Baixo até 1 em 10 anos; Médio 2 ou 3; Alto 4 ou mais. */
export function nivelRisco(frequencia: number): Nivel {
  const x = Math.round(frequencia * 10);
  if (x <= 1) return "Baixo";
  if (x <= 3) return "Médio";
  return "Alto";
}

/** "X de cada 10 anos", arredondado. */
export function deCada10(frequencia: number): number {
  return Math.round(frequencia * 10);
}

export const AVISO_BAIXADA =
  "Baixadas acumulam ar frio; o risco local tende a ser maior que o calculado para a região.";
