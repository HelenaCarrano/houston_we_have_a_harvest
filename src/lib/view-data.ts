// Prepara, no servidor (em tempo de build), tudo que a tela principal precisa.
// Só usa dados reais da NASA POWER + o motor em src/lib/engine.

import pb from "@/data/power_daily_pato-branco.json";
import cv from "@/data/power_daily_cascavel.json";
import fb from "@/data/power_daily_francisco-beltrao.json";
import {
  PARAMS_PADRAO,
  riscoPorData,
  confianca,
  nivelRisco,
  type Nivel,
  type DadosDiarios,
  type EngineParams,
  type Confianca,
} from "@/lib/engine/index.ts";

const DIA = 86_400_000;

export interface RiscoView {
  anosComEvento: number;
  totalAnos: number;
  frequencia: number;
  anos: number[];
  periodo: [number, number] | null;
  confianca: Confianca;
  nivel: Nivel;
  /** Só geada: anos com geada forte. */
  anosFortes?: number[];
  /** Só seca: anos por sinal. */
  detalheSeca?: { anosSoloSeco: number[]; anosVeranico: number[]; anosAmbos: number[] };
}

export interface DataView {
  /** "MM-DD" */
  dataSoja: string;
  colheitaSoja: string;
  plantioMilho: string;
  floracao: string;
  faseInicio: string;
  faseFim: string;
  geada: RiscoView;
  geadaBaixada: RiscoView;
  seca: RiscoView;
}

export interface Prova2026 {
  disponivel: boolean;
  ultimaData: string;
  chuvaAbril2026: number | null;
  chuvaAbrilMedia: number;
  soloAbril2026: number | null;
  soloAbrilMedia: number;
  /** Posição de abril/2026 entre os abris de 1981–2026 (1 = mais seco). */
  soloAbrilRank: number | null;
  soloAbrilAnos: number;
  minMaio2026: number | null;
  minMaio2026Data: string | null;
  minJunho2026: number | null;
  minJunho2026Data: string | null;
  diasFrioMaioJunho2026: number | null;
}

export interface LocalView {
  id: string;
  nome: string;
  lat: number;
  lon: number;
  elevacaoGradeM: number | null;
  periodoDados: { inicio: string; fim: string };
  downloadedAt: string;
  url: string;
  datas: DataView[];
  /** Época típica de geada (mediana do 1º e do último dia <= limite, 1981–2025), "MM-DD". */
  epocaGeada: { inicio: string; fim: string; anosComGeada: number; anosTotal: number } | null;
  prova2026: Prova2026;
}

export interface ViewData {
  params: EngineParams;
  locais: LocalView[];
}

/** Datas de plantio da soja oferecidas na tela (inclui as 5 datas padrão do motor). */
function datasSoja(): string[] {
  return ["09-20", "10-01", "10-10", "10-20", "10-30", "11-10", "11-20", "11-30"];
}

const mmdd = (d: Date) => d.toISOString().slice(5, 10);
const r1 = (x: number) => Math.round(x * 10) / 10;

function serieComDatas(d: DadosDiarios) {
  const ini = Date.parse(`${d.meta.start}T00:00:00Z`);
  return (i: number) => new Date(ini + i * DIA);
}

function mediana(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function epocaGeada(d: DadosDiarios, limite: number): LocalView["epocaGeada"] {
  const dataDe = serieComDatas(d);
  const porAno = new Map<number, number[]>(); // dia do ano (desde 1/jan) com frio
  const anos = new Set<number>();
  d.data.T2M_MIN.forEach((v, i) => {
    const dt = dataDe(i);
    const y = dt.getUTCFullYear();
    if (y > 2025) return;
    anos.add(y);
    if (v === null || v > limite) return;
    const doy = Math.round((dt.getTime() - Date.UTC(y, 0, 1)) / DIA);
    if (!porAno.has(y)) porAno.set(y, []);
    porAno.get(y)!.push(doy);
  });
  if (porAno.size === 0) return null;
  const primeiros = [...porAno.values()].map((xs) => Math.min(...xs));
  const ultimos = [...porAno.values()].map((xs) => Math.max(...xs));
  const toMMDD = (doy: number) => mmdd(new Date(Date.UTC(2025, 0, 1) + Math.round(doy) * DIA));
  return {
    inicio: toMMDD(mediana(primeiros)),
    fim: toMMDD(mediana(ultimos)),
    anosComGeada: porAno.size,
    anosTotal: anos.size,
  };
}

function prova2026(d: DadosDiarios, limite: number): Prova2026 {
  const dataDe = serieComDatas(d);
  const chuvaAbril = new Map<number, { s: number; n: number }>();
  const soloAbril = new Map<number, { s: number; n: number }>();
  let minMaio: number | null = null;
  let minMaioData: string | null = null;
  let minJun: number | null = null;
  let minJunData: string | null = null;
  let diasFrio = 0;
  let temMaioJun = false;

  d.data.T2M_MIN.forEach((t, i) => {
    const dt = dataDe(i);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    if (m === 4) {
      const p = d.data.PRECTOTCORR[i];
      const g = d.data.GWETROOT[i];
      if (p !== null) {
        const a = chuvaAbril.get(y) ?? { s: 0, n: 0 };
        a.s += p;
        a.n++;
        chuvaAbril.set(y, a);
      }
      if (g !== null) {
        const a = soloAbril.get(y) ?? { s: 0, n: 0 };
        a.s += g;
        a.n++;
        soloAbril.set(y, a);
      }
    }
    if (y === 2026 && (m === 5 || m === 6) && t !== null) {
      temMaioJun = true;
      if (t <= limite) diasFrio++;
      if (m === 5 && (minMaio === null || t < minMaio)) {
        minMaio = t;
        minMaioData = dt.toISOString().slice(0, 10);
      }
      if (m === 6 && (minJun === null || t < minJun)) {
        minJun = t;
        minJunData = dt.toISOString().slice(0, 10);
      }
    }
  });

  const completos = (mp: Map<number, { s: number; n: number }>) =>
    [...mp.entries()].filter(([, v]) => v.n === 30);
  const histChuva = completos(chuvaAbril).filter(([y]) => y <= 2025);
  const histSolo = completos(soloAbril).filter(([y]) => y <= 2025);
  const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  const c26 = chuvaAbril.get(2026);
  const s26 = soloAbril.get(2026);
  const solo26 = s26 && s26.n === 30 ? s26.s / 30 : null;
  const todosSolo = completos(soloAbril).map(([, v]) => v.s / v.n);
  const rank = solo26 === null ? null : todosSolo.filter((x) => x < solo26).length + 1;

  return {
    disponivel: !!c26 && c26.n === 30,
    ultimaData: d.meta.end,
    chuvaAbril2026: c26 && c26.n === 30 ? Math.round(c26.s) : null,
    chuvaAbrilMedia: Math.round(media(histChuva.map(([, v]) => v.s))),
    soloAbril2026: solo26 === null ? null : Math.round(solo26 * 100) / 100,
    soloAbrilMedia: Math.round(media(histSolo.map(([, v]) => v.s / v.n)) * 100) / 100,
    soloAbrilRank: rank,
    soloAbrilAnos: todosSolo.length,
    minMaio2026: minMaio === null ? null : r1(minMaio),
    minMaio2026Data: minMaioData,
    minJunho2026: minJun === null ? null : r1(minJun),
    minJunho2026Data: minJunData,
    diasFrioMaioJunho2026: temMaioJun ? diasFrio : null,
  };
}

const FONTES: { id: string; dados: DadosDiarios }[] = [
  { id: "pato-branco", dados: pb as unknown as DadosDiarios },
  { id: "cascavel", dados: cv as unknown as DadosDiarios },
  { id: "francisco-beltrao", dados: fb as unknown as DadosDiarios },
];

export function buildViewData(params: EngineParams = PARAMS_PADRAO): ViewData {
  const datas = datasSoja();
  const locais = FONTES.map(({ id, dados }) => {
    const m = dados.meta as Record<string, unknown>;
    const riscos = riscoPorData(dados, params, datas, 2025);
    const view = (r: (typeof riscos)[number]["geada"]): RiscoView => ({
      anosComEvento: r.anosComEvento,
      totalAnos: r.totalAnos,
      frequencia: r.frequencia,
      anos: r.anosListados,
      ...(r.anosFortes ? { anosFortes: r.anosFortes } : {}),
      ...(r.detalheSeca ? { detalheSeca: r.detalheSeca } : {}),
      nivel: nivelRisco(r.frequencia),
      periodo: r.periodo,
      confianca: confianca(r.totalAnos),
    });
    return {
      id,
      nome: String(m.name),
      lat: Number(m.lat),
      lon: Number(m.lon),
      elevacaoGradeM: typeof m.gridElevationM === "number" ? Math.round(m.gridElevationM) : null,
      periodoDados: { inicio: dados.meta.start, fim: dados.meta.end },
      downloadedAt: String(m.downloadedAt),
      url: String(m.url),
      datas: riscos.map((r) => ({
        dataSoja: r.dataSoja,
        colheitaSoja: mmdd(r.cronograma.colheitaSoja),
        plantioMilho: mmdd(r.cronograma.plantioMilho),
        floracao: mmdd(r.cronograma.floracaoMilho),
        faseInicio: mmdd(r.cronograma.faseInicio),
        faseFim: mmdd(r.cronograma.faseFim),
        geada: view(r.geada),
        geadaBaixada: view(r.geadaBaixada),
        seca: view(r.seca),
      })),
      epocaGeada: epocaGeada(dados, params.limiteGeadaC),
      prova2026: prova2026(dados, params.limiteGeadaC),
    } satisfies LocalView;
  });
  return { params, locais };
}
