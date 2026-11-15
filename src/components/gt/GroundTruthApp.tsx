"use client";

import { useEffect, useMemo, useState } from "react";
import type { DataView, LocalView, RiscoView, ViewData } from "@/lib/view-data";
import { Rotacoes, SeloNivel } from "@/components/gt/Rotacoes";
import { Previsao } from "@/components/gt/Previsao";
import { CampoDescoberto } from "@/components/gt/CampoDescoberto";
import {
  CONFIANCA_EN,
  LangContext,
  MESES_EIXO,
  TRIMESTRE_MESES,
  fmtData,
  fmtDia,
  fmtNum,
  useLang,
  useT,
  type Lang,
} from "@/lib/i18n";
import type { FaseEnso, FiltroEnso } from "@/lib/engine/enso.ts";

const FILTROS_ENSO: { id: FiltroEnso; pt: string; en: string; fpt: string; fen: string }[] = [
  { id: "todos", pt: "Todos os anos", en: "All years", fpt: "todos os anos", fen: "all years" },
  { id: "el-nino", pt: "Anos de El Niño", en: "El Niño years", fpt: "anos de El Niño", fen: "El Niño years" },
  { id: "la-nina", pt: "Anos de La Niña", en: "La Niña years", fpt: "anos de La Niña", fen: "La Niña years" },
  { id: "neutro", pt: "Anos neutros", en: "Neutral years", fpt: "anos neutros", fen: "neutral years" },
];

/** Amostra pequena: abaixo disso a leitura pede cautela (regra de confiança da Metodologia: 12 anos). */
const AMOSTRA_MINIMA = 12;

// ---------- utilitários ----------

/** "X/10" e frase honesta para frequências pequenas. */
function deCada10(r: RiscoView, lang: Lang): { grande: string; frase: string } {
  const x = Math.round(r.frequencia * 10);
  if (r.anosComEvento === 0)
    return { grande: "0/10", frase: lang === "en" ? "none in 10 years" : "nenhum ano em 10" };
  if (x === 0)
    return { grande: "<1/10", frase: lang === "en" ? "fewer than 1 in every 10 years" : "menos de 1 de cada 10 anos" };
  return { grande: `${x}/10`, frase: lang === "en" ? `${x} in every 10 years` : `${x} de cada 10 anos` };
}

/** Dias desde 1º/set (eixo da linha do tempo: set → ago). */
function diaNoEixo(mmdd: string): number {
  const m = Number(mmdd.slice(0, 2));
  const d = Number(mmdd.slice(3, 5));
  const ano = m >= 9 ? 2025 : 2026;
  return Math.round((Date.UTC(ano, m - 1, d) - Date.UTC(2025, 8, 1)) / 86_400_000);
}
const EIXO = 365;
const pct = (mmdd: string) => `${(diaNoEixo(mmdd) / EIXO) * 100}%`;
const larg = (a: string, b: string) => `${(Math.max(diaNoEixo(b) - diaNoEixo(a), 1) / EIXO) * 100}%`;

// ---------- componentes ----------

/** Bloco recolhido: o conteúdo só é montado (e a previsão só é buscada) depois de aberto. */
function MaisEvidencias({ titulo, itens, children }: { titulo: string; itens: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <details
      className="rounded-[22px] border border-gt-line bg-gt-card"
      onToggle={(e) => setAberto(e.currentTarget.open)}
    >
      <summary className="flex min-h-11 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex-col gap-1 p-4 sm:p-6">
        <span className="text-xl font-black">+ {titulo}</span>
        <span className="font-mono text-[11px] text-gt-faint">{itens}</span>
      </summary>
      {aberto && <div className="flex flex-col gap-4 px-2 pb-2 sm:px-3 sm:pb-3">{children}</div>}
    </details>
  );
}

function Rotulo({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint ${className}`}>{children}</p>
  );
}

function Fonte({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] leading-relaxed text-gt-faint">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`gt-rise rounded-[22px] border border-gt-line bg-gt-card p-4 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function LinhaDoTempo({ d, local }: { d: DataView; local: LocalView }) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const ep = local.epocaGeada;
  return (
    <div>
      <div className="relative h-28 select-none" aria-hidden="true">
        {ep && (
          <div
            className="absolute top-0 bottom-6 rounded-lg border border-dashed border-gt-frost-line bg-gt-frost-bg/70"
            style={{ left: pct(ep.inicio), width: larg(ep.inicio, ep.fim) }}
          >
            <span className="absolute right-1 top-1 font-mono text-[10px] text-gt-frost">❄ {t("geada", "frost")}</span>
          </div>
        )}
        <div
          className="absolute top-4 h-7 rounded-lg bg-gt-soy motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.dataSoja), width: larg(d.dataSoja, d.colheitaSoja) }}
        >
          <span className="px-2 text-xs font-extrabold leading-7 text-gt-text">{t("Soja", "Soybean")}</span>
        </div>
        <div
          className="absolute top-13 h-7 rounded-lg bg-gt-gold motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.plantioMilho), width: larg(d.plantioMilho, d.faseFim) }}
        >
          <span className="whitespace-nowrap px-2 text-xs font-extrabold leading-7 text-gt-bg">{t("Milho", "Corn")}</span>
        </div>
        <div
          className="gt-pulse absolute top-12 h-9 rounded-lg border-2 border-gt-orange motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.faseInicio), width: larg(d.faseInicio, d.faseFim) }}
        />
        <div className="absolute bottom-0 left-0 right-0 flex border-t border-gt-line">
          {MESES_EIXO[lang].map((m) => (
            <span key={m} className="flex-1 pt-1 text-center font-mono text-[10px] text-gt-faint">
              {m}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <li>
          <span className="text-gt-muted">{t("Plantio soja", "Soybean planting")} </span>
          <b>{dia(d.dataSoja)}</b>
        </li>
        <li>
          <span className="text-gt-muted">{t("Plantio milho", "Corn planting")} </span>
          <b>{dia(d.plantioMilho)}</b>
        </li>
        <li>
          <span className="text-gt-orange">{t("Fase crítica", "Critical stage")} </span>
          <b>
            {dia(d.faseInicio)}–{dia(d.faseFim)}
          </b>
        </li>
        {ep && (
          <li>
            <span className="text-gt-frost">{t("Época de geada", "Frost season")} </span>
            <b>
              {dia(ep.inicio)}–{dia(ep.fim)}
            </b>
          </li>
        )}
      </ul>
    </div>
  );
}

function BlocoRelevo({ local, baixada }: { local: LocalView; baixada: boolean }) {
  const t = useT();
  const lang = useLang();
  const r = local.relevo;
  if (!r || r.pontoM === null) return null;
  const dif = local.elevacaoGradeM === null ? null : r.pontoM - local.elevacaoGradeM;
  const a = r.amostra;
  const fonte = r.estimado
    ? t(r.fonte, "ESTIMATED: mean elevation of the NASA POWER cell (SRTM unavailable at download time)")
    : t(r.fonte, "NASA SRTM 30 m (SRTM v3, 1 arc-second) via OpenTopoData");
  return (
    <div className="rounded-[18px] border border-gt-line bg-gt-card2 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-green">
        {t("Relevo", "Relief")} · {r.estimado ? t("valor ESTIMADO", "ESTIMATED value") : "NASA SRTM 30 m"}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        <li>
          {t(`Altitude no ponto de ${local.nome}:`, `Elevation at the ${local.nome} point:`)} <b>{r.pontoM} m</b>
          {r.estimado ? t(" (estimativa: média da célula do POWER)", " (estimate: NASA POWER cell average)") : ""}.
        </li>
        {local.elevacaoGradeM !== null && (
          <li>
            {t("Altitude média da célula do NASA POWER:", "Mean elevation of the NASA POWER cell:")}{" "}
            <b>{local.elevacaoGradeM} m</b>
            {dif !== null && !r.estimado
              ? t(
                  ` (o ponto está ${Math.abs(dif)} m ${dif >= 0 ? "acima" : "abaixo"})`,
                  ` (the point is ${Math.abs(dif)} m ${dif >= 0 ? "above" : "below"})`,
                )
              : ""}
            .
          </li>
        )}
        {a && (
          <li>
            {t(
              `Em ${fmtNum(a.raioM / 1000, 1, lang)} km ao redor (${a.pontos} pontos a cada ${a.espacamentoM} m) a altitude varia de `,
              `Within ${fmtNum(a.raioM / 1000, 1, lang)} km around (${a.pontos} points every ${a.espacamentoM} m) elevation ranges from `,
            )}
            <b>
              {a.minM} {t("a", "to")} {a.maxM} m
            </b>{" "}
            {t(`(${a.maxM - a.minM} m de desnível). O ponto fica `, `(${a.maxM - a.minM} m of relief). The point sits `)}
            {Math.abs(r.pontoM - a.mediaM)} m{" "}
            {r.pontoM >= a.mediaM ? t("acima", "above") : t("abaixo", "below")}{" "}
            {t("da média desse entorno.", "the average of that surrounding area.")}
          </li>
        )}
      </ul>
      <p className="mt-2 text-sm text-gt-muted">
        {baixada
          ? t(
              "Você marcou baixada: o limite de geada sobe +1 °C (hipótese). O relevo mostra o desnível do entorno, mas ainda não classifica cada talhão.",
              "You ticked lowland: the frost limit rises +1 °C (hypothesis). Relief shows the height range around the point but does not yet classify each plot.",
            )
          : t(
              "Se a sua lavoura fica num fundo de vale, marque “baixada”: o ar frio escorre e se acumula ali.",
              "If your field is in a valley bottom, tick “lowland”: cold air drains and pools there.",
            )}{" "}
        {t(
          "A temperatura do POWER é a da célula, sem correção de altitude.",
          "POWER temperature is the grid-cell value, without elevation correction.",
        )}
      </p>
      <Fonte>
        {fonte}. {t("Baixado em", "Downloaded on")} {fmtData(r.baixadoEm.slice(0, 10), lang)}.
        {r.fonteUrl && (
          <>
            {" "}
            <a className="underline underline-offset-2" href={r.fonteUrl} target="_blank" rel="noreferrer">
              {t("Fonte", "Source")}
            </a>
            .
          </>
        )}
      </Fonte>
    </div>
  );
}

function CardRisco({
  titulo,
  tipo,
  r,
  regra,
  extra,
  filtro,
}: {
  titulo: string;
  tipo: "geada" | "seca";
  r: RiscoView;
  regra: string;
  extra?: React.ReactNode;
  /** Texto do filtro de ENSO ativo (vazio = todos os anos). */
  filtro?: string;
}) {
  const t = useT();
  const lang = useLang();
  const cor = tipo === "geada" ? "text-gt-frost" : "text-gt-orange";
  const barra = tipo === "geada" ? "bg-gt-frost" : "bg-gt-orange";
  const x = deCada10(r, lang);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-extrabold">{titulo}</h2>
        <SeloNivel nivel={r.nivel} rotulo={t("Risco", "Risk")} />
      </div>
      <p className={`text-[40px] font-black leading-none ${cor}`}>
        {x.grande} <span className="text-base font-semibold text-gt-muted">{t("anos", "years")}</span>
      </p>
      <p className="text-base">
        <b>{x.frase}</b>
        {t(
          `: aconteceu em ${r.anosComEvento} de ${r.totalAnos} safras`,
          `: happened in ${r.anosComEvento} of ${r.totalAnos} seasons`,
        )}
        {r.periodo ? ` (${r.periodo[0]}–${r.periodo[1]})` : ""}.
      </p>
      <div
        className="flex gap-[2px]"
        role="img"
        aria-label={t("Anos com evento: ", "Years with the event: ") + (r.anos.join(", ") || t("nenhum", "none"))}
      >
        {r.periodo &&
          Array.from({ length: r.periodo[1] - r.periodo[0] + 1 }, (_, i) => r.periodo![0] + i).map((ano) => (
            <span
              key={ano}
              title={String(ano)}
              className={`h-5 flex-1 rounded-[2px] ${r.anos.includes(ano) ? barra : "bg-gt-line"}`}
            />
          ))}
      </div>
      <p className="text-sm text-gt-muted">
        {r.anos.length
          ? `${t("Anos", "Years")}: ${r.anos.join(", ")}`
          : t("Nenhum ano com o evento neste período.", "No year with the event in this period.")}
        {r.anosFortes && r.anosFortes.length > 0 && (
          <>
            {" "}
            · <b className="text-gt-frost">{t("Geada forte", "Strong frost")}</b> (≤ 1 °C): {r.anosFortes.join(", ")}
          </>
        )}
      </p>
      {r.detalheSeca && (
        <ul className="grid gap-1 rounded-xl border border-gt-line bg-gt-card2 p-3 text-sm">
          <li>
            {t("Solo muito seco:", "Very dry soil:")} <b>{r.detalheSeca.anosSoloSeco.length}</b>{" "}
            {t(`de ${r.totalAnos} anos`, `of ${r.totalAnos} years`)}
          </li>
          <li>
            {t("Veranico de 15+ dias:", "Dry spell of 15+ days:")} <b>{r.detalheSeca.anosVeranico.length}</b>{" "}
            {t(`de ${r.totalAnos} anos`, `of ${r.totalAnos} years`)}
          </li>
          <li>
            {t("Os dois juntos (mais graves):", "Both together (most severe):")} <b>{r.detalheSeca.anosAmbos.length}</b>
            {r.detalheSeca.anosAmbos.length ? ` (${r.detalheSeca.anosAmbos.join(", ")})` : ""}
          </li>
        </ul>
      )}
      <p className="text-sm text-gt-muted">{regra}</p>
      {extra}
      <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
        NASA POWER {r.periodo ? `${r.periodo[0]}–${r.periodo[1]}` : ""}
        {filtro ? ` · ${filtro}` : ""} · {t("confiança", "confidence")}{" "}
        {t(r.confianca, CONFIANCA_EN[r.confianca] ?? r.confianca)}
      </p>
    </Card>
  );
}

function GraficoDatas({
  datas,
  idx,
  onSelect,
  baixada,
}: {
  datas: DataView[];
  idx: number;
  onSelect: (i: number) => void;
  baixada: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const g = (d: DataView) => (baixada ? d.geadaBaixada : d.geada);
  const max = Math.max(...datas.map((d) => Math.max(g(d).frequencia, d.seca.frequencia)), 0.1);
  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 120 }}>
        {datas.map((d, i) => (
          <button
            key={d.dataSoja}
            onClick={() => onSelect(i)}
            aria-label={t(
              `Soja em ${fmtDia(d.dataSoja, lang)}: geada ${g(d).anosComEvento} de ${g(d).totalAnos}, seca ${d.seca.anosComEvento} de ${d.seca.totalAnos}`,
              `Soybean on ${fmtDia(d.dataSoja, lang)}: frost ${g(d).anosComEvento} of ${g(d).totalAnos}, drought ${d.seca.anosComEvento} of ${d.seca.totalAnos}`,
            )}
            aria-pressed={i === idx}
            className={`flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 rounded-lg px-0.5 pb-0.5 ${
              i === idx ? "bg-gt-card2 outline outline-1 outline-gt-green" : "hover:bg-gt-card2"
            }`}
          >
            <span
              className="w-1/2 max-w-4 rounded-t-sm bg-gt-frost motion-safe:transition-all"
              style={{ height: `${(g(d).frequencia / max) * 100}%`, minHeight: 2 }}
            />
            <span
              className="w-1/2 max-w-4 rounded-t-sm bg-gt-orange motion-safe:transition-all"
              style={{ height: `${(d.seca.frequencia / max) * 100}%`, minHeight: 2 }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5 sm:gap-3">
        {datas.map((d) => (
          <span key={d.dataSoja} className="min-w-0 flex-1 text-center font-mono text-[10px] text-gt-faint">
            {fmtDia(d.dataSoja, lang)}
          </span>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 font-mono text-[11px] text-gt-faint">
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-gt-frost" />{" "}
          {t("geada na fase crítica", "frost in the critical stage")}
        </span>
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-gt-orange" />{" "}
          {t("seca na fase crítica", "drought in the critical stage")}
        </span>
      </p>
    </div>
  );
}

function Recomendacao({ datas, idx, baixada }: { datas: DataView[]; idx: number; baixada: boolean }) {
  const t = useT();
  const lang = useLang();
  const g = (d: DataView) => (baixada ? d.geadaBaixada : d.geada);
  const sel = datas[idx];
  const minG = Math.min(...datas.map((d) => g(d).anosComEvento));
  let ate = 0;
  datas.forEach((d, i) => {
    if (g(d).anosComEvento === minG) ate = i;
  });
  const alvo = datas[ate];
  const ok = idx <= ate;
  return (
    <div
      className={`rounded-[18px] border p-4 ${
        ok ? "border-gt-safe-line bg-gt-safe-bg text-gt-safe-text" : "border-gt-risk-line bg-gt-risk-bg text-gt-risk-text"
      }`}
    >
      <p className="text-lg leading-snug sm:text-xl">
        {t("Plantando a soja até", "Planting soybeans by")} <b className="font-black">{fmtDia(alvo.dataSoja, lang)}</b>
        {t(", o risco de geada na fase crítica cai para ", ", frost risk in the critical stage drops to ")}
        <b className="font-black">{deCada10(g(alvo), lang).frase}</b>{" "}
        {t(
          `(${g(alvo).anosComEvento} de ${g(alvo).totalAnos} safras).`,
          `(${g(alvo).anosComEvento} of ${g(alvo).totalAnos} seasons).`,
        )}
        {!ok && (
          <>
            {" "}
            {t(
              `Na data escolhida (${fmtDia(sel.dataSoja, lang)}) foram ${g(sel).anosComEvento} de ${g(sel).totalAnos}.`,
              `On the chosen date (${fmtDia(sel.dataSoja, lang)}) it was ${g(sel).anosComEvento} of ${g(sel).totalAnos}.`,
            )}
          </>
        )}
      </p>
      <p className="pt-2 text-sm">
        {t(
          "Confira também a seca e a janela do ZARC do seu município (necessária para crédito e seguro). A decisão final é com o técnico.",
          "Also check drought and your municipality’s ZARC planting window (needed for credit and crop insurance in Brazil). The final decision is with the farmer and the technician.",
        )}
      </p>
    </div>
  );
}

function Prova2026({ local, d, limite }: { local: LocalView; d: DataView; limite: number }) {
  const t = useT();
  const lang = useLang();
  const p = local.prova2026;
  const app2026 = {
    geada: d.geada.anos.includes(2026),
    geadaBaixada: d.geadaBaixada.anos.includes(2026),
    seca: d.seca.anos.includes(2026),
  };
  const simNao = (b: boolean) => (b ? t("sim", "yes") : t("não", "no"));
  return (
    <Card>
      <Rotulo>
        {t("Prova 2026", "2026 proof")} · {local.nome}
      </Rotulo>
      <h2 className="mt-1 text-2xl font-black">
        {t("O que o satélite viu na safrinha 2026", "What the satellite saw in the 2026 second crop")}
      </h2>
      {!p.disponivel ? (
        <p className="mt-3">
          {t(
            "Os dados diários de 2026 ainda não estão disponíveis no NASA POWER para este local.",
            "Daily 2026 data are not yet available in NASA POWER for this location.",
          )}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[18px] border border-gt-frost-line bg-gt-frost-bg p-4 text-gt-frost-text">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-frost">
              NASA POWER · {t("dados diários", "daily data")}
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <b>{t("Umidade do solo na raiz (GWETROOT), abril/2026:", "Root-zone soil moisture (GWETROOT), April 2026:")}</b>{" "}
                {fmtNum(p.soloAbril2026 ?? 0, 2, lang)} ({t("média", "mean")} 1981–2025: {fmtNum(p.soloAbrilMedia, 2, lang)}).{" "}
                {t(
                  `${p.soloAbrilRank}º abril mais seco em ${p.soloAbrilAnos} anos.`,
                  `April 2026 ranks #${p.soloAbrilRank} driest out of ${p.soloAbrilAnos} years.`,
                )}
              </li>
              <li>
                <b>{t("Chuva em abril/2026:", "Rainfall in April 2026:")}</b> {p.chuvaAbril2026} mm ({t("média", "mean")}{" "}
                1981–2025: {p.chuvaAbrilMedia} mm).
                {p.chuvaAbril2026 !== null && p.chuvaAbril2026 > p.chuvaAbrilMedia && (
                  <>
                    {" "}
                    {t(
                      "A chuva total ficou acima da média; o solo, mesmo assim, ficou seco.",
                      "Total rain was above average; the soil was still dry.",
                    )}
                  </>
                )}
              </li>
              {p.minMaio2026 !== null && p.minMaio2026Data && (
                <li>
                  <b>{t("Menor temperatura do ar (2 m) em maio/2026:", "Lowest 2 m air temperature in May 2026:")}</b>{" "}
                  {fmtNum(p.minMaio2026, 1, lang)} °C {t("em", "on")} {fmtData(p.minMaio2026Data, lang)}.
                </li>
              )}
              {p.minJunho2026 !== null && p.minJunho2026Data && (
                <li>
                  <b>{t("Em junho/2026:", "In June 2026:")}</b> {fmtNum(p.minJunho2026, 1, lang)} °C {t("em", "on")}{" "}
                  {fmtData(p.minJunho2026Data, lang)}.
                </li>
              )}
              {p.diasFrioMaioJunho2026 !== null && (
                <li>
                  <b>
                    {t(
                      `Dias com mínima ≤ ${limite} °C em maio e junho/2026:`,
                      `Days with minimum ≤ ${limite} °C in May and June 2026:`,
                    )}
                  </b>{" "}
                  {p.diasFrioMaioJunho2026}.
                </li>
              )}
              {local.trigo.minimaJanela2026 !== null && (
                <li>
                  <b>
                    {t(
                      `Janela do espigamento do trigo (${fmtDia(local.trigo.janela.inicio, lang)}–${fmtDia(local.trigo.janela.fim, lang)}/2026):`,
                      `Wheat heading window (${fmtDia(local.trigo.janela.inicio, lang)}–${fmtDia(local.trigo.janela.fim, lang)}, 2026):`,
                    )}
                  </b>{" "}
                  {t("menor mínima", "lowest minimum")} {fmtNum(local.trigo.minimaJanela2026, 1, lang)} °C →{" "}
                  {local.trigo.minimaJanela2026 <= limite
                    ? t(`geada ≤ ${limite} °C.`, `frost ≤ ${limite} °C.`)
                    : t(`sem geada ≤ ${limite} °C. `, `no frost ≤ ${limite} °C. `)}
                  {t(
                    "Atenção: o relato do Deral sobre o trigo é de maio, com a lavoura ainda em fase vegetativa; esta janela é posterior e, portanto, não é testada por ele.",
                    "Note: the Deral report on wheat is from May, with the crop still vegetative; this window comes later, so it is not tested by that report.",
                  )}
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-[18px] border border-gt-risk-line bg-gt-risk-bg p-4 text-gt-risk-text">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-orange">
              Deral · {t("relatos de campo", "field reports")}
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <b>{t("Abril/2026:", "April 2026:")}</b>{" "}
                {t(
                  "estiagem e calor afetaram o feijão e o milho da safra 2025/26 no Paraná.",
                  "drought and heat hit the beans and corn of the 2025/26 crop in Paraná.",
                )}{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://revistacultivar.com.br/noticias/pr-safra-2025-26-estiagem-e-calor-afetam-feijao-e-milho"
                  target="_blank"
                  rel="noreferrer"
                >
                  Revista Cultivar, {t("9/4/2026", "Apr 9, 2026")}
                </a>
              </li>
              <li>
                <b>{t("Maio/2026:", "May 2026:")}</b>{" "}
                {t(
                  "geadas queimaram folhas do milho safrinha em baixadas; o feijão de 2ª safra teve perdas significativas; o trigo não teve dano significativo.",
                  "frosts burned second-crop corn leaves in lowlands; second-crop beans had significant losses; wheat had no significant damage.",
                )}{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://revistacultivar.com.br/noticias/pr-safra-2025-26-milho-e-feijao-sofrem-impacto-das-geadas"
                  target="_blank"
                  rel="noreferrer"
                >
                  Revista Cultivar, {t("19/5/2026", "May 19, 2026")}
                </a>
              </li>
            </ul>
            <p className="mt-2 font-mono text-[11px] text-gt-risk-text/80">
              {t(
                "Deral = Departamento de Economia Rural da Secretaria de Agricultura do Paraná.",
                "Deral = Rural Economy Department of the Paraná state agriculture secretariat.",
              )}
            </p>
          </div>
          <div className="rounded-[18px] border border-gt-line bg-gt-card2 p-4 md:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-green">
              {t("O que o app marca para 2026", "What the app flags for 2026")} · {t("soja em", "soybean on")}{" "}
              {fmtDia(d.dataSoja, lang)}
            </p>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
              <li>
                {t(`Geada na fase crítica (≤ ${limite} °C):`, `Frost in the critical stage (≤ ${limite} °C):`)}{" "}
                <b>{simNao(app2026.geada)}</b>
              </li>
              <li>
                {t(`Geada em baixada (≤ ${limite + 1} °C):`, `Frost in a lowland (≤ ${limite + 1} °C):`)}{" "}
                <b>{simNao(app2026.geadaBaixada)}</b>
              </li>
              <li>
                {t("Seca na fase crítica:", "Drought in the critical stage:")} <b>{simNao(app2026.seca)}</b>
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className="mt-3">
        <Fonte>
          {t(
            `Dados POWER até ${fmtData(p.ultimaData, lang)}. Grade de ~50 km; temperatura do ar a 2 m, não na superfície. Relatos do Deral são regionais, não medições no ponto do mapa. O resultado é mostrado como sai, bom ou ruim.`,
            `POWER data up to ${fmtData(p.ultimaData, lang)}. ~50 km grid; 2 m air temperature, not surface temperature. Deral reports are regional, not measurements at the map point. The result is shown as it comes out, good or bad.`,
          )}
        </Fonte>
      </div>
    </Card>
  );
}

// ---------- app ----------

export function GroundTruthApp({ data }: { data: ViewData }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (pt: string, en: string) => (lang === "en" ? en : pt);
  const dia = (x: string) => fmtDia(x, lang);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  }, [lang]);

  const [localId, setLocalId] = useState(data.locais[0].id);
  const local = useMemo(() => data.locais.find((l) => l.id === localId) ?? data.locais[0], [data, localId]);
  const [idx, setIdx] = useState(Math.max(local.datas.findIndex((d) => d.dataSoja === "10-20"), 0));
  const [baixada, setBaixada] = useState(false);
  const [fase, setFase] = useState<FiltroEnso>("todos");
  const d = local.datas[idx]; // todos os anos (usado no card "Prova 2026" e no texto de abertura)
  const p = data.params;
  // Resultados considerando só os anos da fase escolhida do ENSO ("todos" = sem filtro).
  const dEf: DataView = { ...d, ...d.enso[fase] };
  const datasEf: DataView[] = local.datas.map((x) => ({ ...x, ...x.enso[fase] }));
  const geada = baixada ? dEf.geadaBaixada : dEf.geada;
  const limiteAtual = p.limiteGeadaC + (baixada ? p.ajusteBaixadaC : 0);
  const nomeFase = (f: FiltroEnso) => {
    const x = FILTROS_ENSO.find((q) => q.id === f)!;
    return t(x.pt, x.en);
  };
  /** Nome da fase para o meio de uma frase. */
  const fraseFase = (f: FiltroEnso) => {
    const x = FILTROS_ENSO.find((q) => q.id === f)!;
    return t(x.fpt, x.fen);
  };
  const anosDaFase = fase === "todos" ? [] : d.anosPorFase[fase as FaseEnso];
  const filtroTexto = fase === "todos" ? "" : `${nomeFase(fase)} (${anosDaFase.length})`;
  const ult = data.enso.ultimo;
  const ultFaseNome =
    ult?.fase === "el-nino"
      ? t("El Niño", "El Niño")
      : ult?.fase === "la-nina"
        ? t("La Niña", "La Niña")
        : t("neutras", "neutral");

  return (
    <LangContext.Provider value={lang}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-16 pt-6 sm:px-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-green">
              <span className="gt-pulse">●</span> weharvest · NASA Space Apps 2026 · Field Shift
            </p>
            <div
              className="flex shrink-0 rounded-full border border-gt-btn-line bg-gt-card2 p-0.5"
              role="group"
              aria-label={t("Idioma", "Language")}
            >
              {(["en", "pt"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  lang={l}
                  className={`min-h-11 min-w-12 rounded-full px-3 font-mono text-xs font-semibold ${
                    lang === l ? "bg-gt-green text-gt-bg" : "text-gt-muted hover:text-gt-text"
                  }`}
                >
                  {l === "en" ? "EN" : "PT"}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-[30px] font-black leading-tight sm:text-5xl">
            {t(
              "Se eu plantar a soja nesta data, o milho safrinha pega geada ou seca?",
              "If I plant soybeans on this date, will the second-crop corn meet frost or drought?",
            )}
          </h1>
          <p className="max-w-3xl text-base text-gt-muted sm:text-lg">
            {t(
              `A data da soja define quando o milho safrinha chega à fase crítica (pendoamento e enchimento de grãos). Contamos, em ${d.geada.totalAnos} anos de dados diários da NASA desde 1981, quantas vezes essa fase pegou geada ou seca.`,
              `The soybean planting date decides when the second-crop corn (safrinha) reaches its critical stage (tasseling and grain fill). Using ${d.geada.totalAnos} years of NASA daily data since 1981, we count how often that stage met frost or drought.`,
            )}
          </p>
        </header>

        <Card className="flex flex-col gap-5">
          <div>
            <Rotulo>1 · {t("Município", "Municipality")}</Rotulo>
            <div
              className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label={t("Município", "Municipality")}
            >
              {data.locais.map((l) => (
                <button
                  key={l.id}
                  role="radio"
                  aria-checked={l.id === localId}
                  onClick={() => setLocalId(l.id)}
                  className={`min-h-11 rounded-2xl border px-4 py-2 text-left ${
                    l.id === localId
                      ? "border-gt-green bg-gt-safe-bg text-gt-text"
                      : "border-gt-btn-line bg-gt-card2 text-gt-text hover:border-gt-faint"
                  }`}
                >
                  <span className="block font-extrabold">{l.nome}</span>
                  <span className="block font-mono text-[11px] text-gt-faint">
                    {l.lat.toFixed(2)}, {l.lon.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Rotulo>2 · {t("Data de plantio da soja", "Soybean planting date")}</Rotulo>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={t("Data de plantio da soja", "Soybean planting date")}
            >
              {local.datas.map((x, i) => (
                <button
                  key={x.dataSoja}
                  role="radio"
                  aria-checked={i === idx}
                  onClick={() => setIdx(i)}
                  className={`min-h-11 min-w-16 rounded-full border px-4 font-mono text-sm ${
                    i === idx
                      ? "border-gt-green bg-gt-green font-semibold text-gt-bg"
                      : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-btn-line"
                  }`}
                >
                  {dia(x.dataSoja)}
                </button>
              ))}
            </div>
          </div>

          <details className="group rounded-2xl border border-gt-line bg-gt-card2 p-3" open={fase !== "todos" ? true : undefined}>
            <summary className="flex min-h-11 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex-wrap items-center justify-between gap-2">
              <Rotulo>3 · {t("Filtro avançado: fase do El Niño", "Advanced filter: El Niño phase")}</Rotulo>
              <span className="font-mono text-xs text-gt-muted">
                {fase === "todos"
                  ? t(`todos os ${d.geada.totalAnos} anos`, `all ${d.geada.totalAnos} years`)
                  : t(`filtro ativo: ${nomeFase(fase)} (${anosDaFase.length})`, `filter on: ${nomeFase(fase)} (${anosDaFase.length})`)}
              </span>
            </summary>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={t("Anos a considerar", "Years to consider")}
            >
              {FILTROS_ENSO.map((f) => {
                const n = f.id === "todos" ? d.geada.totalAnos : d.anosPorFase[f.id].length;
                return (
                  <button
                    key={f.id}
                    role="radio"
                    aria-checked={fase === f.id}
                    onClick={() => setFase(f.id)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                      fase === f.id
                        ? "border-gt-green bg-gt-green text-gt-bg"
                        : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-btn-line"
                    }`}
                  >
                    {t(f.pt, f.en)} <span className="font-mono text-xs font-normal">({n})</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-gt-muted">
              {fase === "todos"
                ? t(
                    "Dica: escolha a fase prevista para a próxima safra para ver só os anos parecidos. O app não adivinha a fase por você.",
                    "Tip: pick the phase forecast for the coming season to see only similar years. The app does not guess the phase for you.",
                  )
                : t(
                    `Mostrando só os ${anosDaFase.length} ${fraseFase(fase)} para esta data de plantio: ${anosDaFase.join(", ")}.`,
                    `Showing only the ${anosDaFase.length} ${fraseFase(fase)} for this planting date: ${anosDaFase.join(", ")}.`,
                  )}
            </p>
            {fase !== "todos" && anosDaFase.length < AMOSTRA_MINIMA && (
              <p className="mt-2 rounded-xl border border-gt-risk-line bg-gt-risk-bg p-3 text-sm text-gt-risk-text">
                {t(
                  `Poucos anos (${anosDaFase.length}): um ano a mais ou a menos muda bastante o resultado. Leia com cautela.`,
                  `Few seasons (${anosDaFase.length}): one more or one fewer year changes the result a lot. Read with caution.`,
                )}
              </p>
            )}
            {ult && (
              <p className="mt-2 rounded-xl border border-gt-frost-line bg-gt-frost-bg p-3 text-sm text-gt-frost-text">
                {t(
                  `Último valor publicado pela NOAA (RONI, ${TRIMESTRE_MESES[ult.trimestre]?.pt ?? ult.trimestre}/${ult.ano}): ${ult.valor > 0 ? "+" : ""}${fmtNum(ult.valor, 2, lang)} → condições ${ultFaseNome === "El Niño" ? "de El Niño" : ultFaseNome === "La Niña" ? "de La Niña" : "neutras"}. `,
                  `Latest value published by NOAA (RONI, ${TRIMESTRE_MESES[ult.trimestre]?.en ?? ult.trimestre} ${ult.ano}): ${ult.valor > 0 ? "+" : ""}${fmtNum(ult.valor, 2, lang)} → ${ultFaseNome} conditions. `,
                )}
                {t(
                  "É a leitura mais recente, não uma previsão: a fase da próxima safra é decidida pela previsão sazonal da NOAA.",
                  "This is the most recent reading, not a forecast: the phase of the coming season depends on NOAA's seasonal outlook.",
                )}{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Previsão da NOAA", "NOAA ENSO outlook")}
                </a>
                .
              </p>
            )}
            <Fonte>
              {t(
                "Fase de cada safra = RONI da NOAA (índice oficial do ENSO) no trimestre do meio da fase crítica do milho; ≥ +0,5 = El Niño, ≤ −0,5 = La Niña. Regra simplificada (a NOAA exige 5 trimestres seguidos para declarar um episódio). O ONI antigo classificaria cerca de 15% dos trimestres de outra forma. Limites de seca continuam calculados com todos os anos.",
                "Phase of each season = NOAA's RONI (official ENSO index) in the 3-month season at the middle of the corn critical stage; ≥ +0.5 = El Niño, ≤ −0.5 = La Niña. Simplified rule (NOAA requires 5 consecutive seasons to declare an episode). The older ONI would classify about 15% of seasons differently. Drought limits are still computed with all years.",
              )}{" "}
              {t("Dados baixados em", "Data downloaded on")} {fmtData(data.enso.baixadoEm.slice(0, 10), lang)}.{" "}
              <a className="underline underline-offset-2" href={data.enso.url} target="_blank" rel="noreferrer">
                {t("Fonte", "Source")}
              </a>
              .
            </Fonte>
          </details>

          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={baixada}
              onChange={(e) => setBaixada(e.target.checked)}
              className="size-5 accent-[#9BE36B]"
            />
            <span>
              {t("Minha lavoura fica em ", "My field is in a ")}
              <b>{t("baixada", "lowland")}</b>{" "}
              <span className="text-sm text-gt-faint">
                {t(
                  `(limite de geada sobe de ${p.limiteGeadaC} para ${p.limiteGeadaC + p.ajusteBaixadaC} °C)`,
                  `(frost limit rises from ${p.limiteGeadaC} to ${p.limiteGeadaC + p.ajusteBaixadaC} °C)`,
                )}
              </span>
            </span>
          </label>
        </Card>

        <Card>
          <Rotulo>{t("Linha do tempo soja → milho safrinha", "Timeline: soybean → second-crop corn")}</Rotulo>
          <div className="mt-3">
            <LinhaDoTempo d={d} local={local} />
          </div>
          <Fonte>
            {t(
              `Hipóteses a validar com agronomia/ZARC: soja ${p.cicloSoja} dias, intervalo ${p.intervalo} dias, fase crítica do milho de ${p.faseCriticaInicio} a ${p.faseCriticaFim} dias após o plantio.`,
              `Hypotheses to validate with agronomy/ZARC: soybean ${p.cicloSoja} days, gap ${p.intervalo} days, corn critical stage from ${p.faseCriticaInicio} to ${p.faseCriticaFim} days after planting.`,
            )}
          </Fonte>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <CardRisco
            titulo={
              baixada
                ? t("Geada na fase crítica · baixada", "Frost in the critical stage · lowland")
                : t("Geada na fase crítica", "Frost in the critical stage")
            }
            tipo="geada"
            r={geada}
            filtro={filtroTexto}
            regra={t(
              `Ano com geada = mínima do ar a 2 m ≤ ${limiteAtual} °C em algum dia entre ${dia(d.faseInicio)} e ${dia(d.faseFim)}. ${p.limiteGeadaC} °C no abrigo ≈ geada na relva (Embrapa).`,
              `Frost year = 2 m air minimum ≤ ${limiteAtual} °C on any day between ${dia(d.faseInicio)} and ${dia(d.faseFim)}. ${p.limiteGeadaC} °C at screen height ≈ frost at grass level (Embrapa).`,
            )}
            extra={
              baixada ? (
                <p className="rounded-xl border border-gt-frost-line bg-gt-frost-bg p-3 text-sm text-gt-frost-text">
                  {t(
                    `❄ Baixadas acumulam ar frio em noites calmas. Usamos +${p.ajusteBaixadaC} °C no limite (hipótese a calibrar); o risco local pode ser ainda maior. Sem baixada: ${dEf.geada.anosComEvento} de ${dEf.geada.totalAnos}.`,
                    `❄ Lowlands trap cold air on calm nights. We add +${p.ajusteBaixadaC} °C to the limit (hypothesis to calibrate); local risk may be even higher. Without lowland: ${dEf.geada.anosComEvento} of ${dEf.geada.totalAnos}.`,
                  )}
                </p>
              ) : null
            }
          />
          <CardRisco
            titulo={t("Seca na fase crítica", "Drought in the critical stage")}
            tipo="seca"
            r={dEf.seca}
            filtro={filtroTexto}
            regra={t(
              `Ano seco = ${p.sequenciaSecaDias}+ dias seguidos com chuva < ${p.chuvaDiaSecoMm} mm OU umidade do solo na raiz entre as ${p.percentilUmidadeSolo}% mais baixas para as mesmas datas, entre ${dia(d.faseInicio)} e ${dia(d.faseFim)}. Como o solo é comparado com a própria história, cerca de 1 em cada 5 anos sempre aparece como solo seco.`,
              `Drought year = ${p.sequenciaSecaDias}+ consecutive days with rain < ${p.chuvaDiaSecoMm} mm OR root-zone soil moisture among the ${p.percentilUmidadeSolo}% lowest for the same dates, between ${dia(d.faseInicio)} and ${dia(d.faseFim)}. Because soil is compared with its own history, about 1 in 5 years always shows up as dry soil.`,
            )}
          />
        </div>

        <Card className="flex flex-col gap-5">
          <Rotulo>{t(`Recomendação para ${local.nome}`, `Recommendation for ${local.nome}`)}</Rotulo>
          <Recomendacao datas={datasEf} idx={idx} baixada={baixada} />
          <GraficoDatas datas={datasEf} idx={idx} onSelect={setIdx} baixada={baixada} />
          {fase !== "todos" && (
            <Fonte>
              {t(
                `Gráfico e recomendação calculados só com os ${fraseFase(fase)}; o número de anos muda de uma data para outra.`,
                `Chart and recommendation use only the ${fraseFase(fase)}; the number of years differs from one date to another.`,
              )}
            </Fonte>
          )}
        </Card>

        <Rotacoes d={dEf} trigo={local.trigo} nomeLocal={local.nome} baixada={baixada} filtroRotulo={filtroTexto} />

        <Prova2026 local={local} d={d} limite={p.limiteGeadaC} />

        <MaisEvidencias
          titulo={t("Mais evidências", "More evidence")}
          itens={t(
            "relevo do terreno (SRTM) · previsão de 16 dias · campo descoberto ao longo do ano",
            "terrain relief (SRTM) · 16-day forecast · bare field through the year",
          )}
        >
          <BlocoRelevo local={local} baixada={baixada} />
          <Previsao
            key={local.id}
            nome={local.nome}
            lat={local.lat}
            lon={local.lon}
            baixada={baixada}
            limiteGeadaC={p.limiteGeadaC}
            ajusteBaixadaC={p.ajusteBaixadaC}
          />
          <CampoDescoberto d={d} nomeLocal={local.nome} params={p} />
        </MaisEvidencias>

        <footer className="flex flex-col gap-2 border-t border-gt-line pt-5">
          <Rotulo>{t("Fontes e limitações", "Sources and limitations")}</Rotulo>
          <Fonte>
            {t("Dados:", "Data:")} NASA POWER Daily API, community AG (T2M_MIN, PRECTOTCORR, GWETROOT),{" "}
            {fmtData(local.periodoDados.inicio, lang)} {t("a", "to")} {fmtData(local.periodoDados.fim, lang)},{" "}
            {t("baixados em", "downloaded on")} {fmtData(local.downloadedAt.slice(0, 10), lang)}.{" "}
            <a
              className="underline underline-offset-2"
              href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/"
              target="_blank"
              rel="noreferrer"
            >
              API
            </a>
            . {t("Limiar de 3 °C: diferença abrigo–relva de 3–6 °C", "3 °C threshold: screen-to-grass difference of 3–6 °C")} (
            <a
              className="underline underline-offset-2"
              href="https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1084446/1/ID442832017CBAGRO20MM398.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Embrapa Trigo
            </a>
            ,{" "}
            <a
              className="underline underline-offset-2"
              href="https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1139138/1/BolAgroClimatico-dez21.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Embrapa
            </a>
            ,{" "}
            <a
              className="underline underline-offset-2"
              href="https://ojs.uel.br/revistas/uel/index.php/semagrarias/article/download/30322/24555/166627"
              target="_blank"
              rel="noreferrer"
            >
              Semina/UEL
            </a>
            ).
          </Fonte>
          <Fonte>
            {t(
              `Limitações: o NASA POWER é uma grade de ~50 km (elevação média da célula: ${local.elevacaoGradeM ?? "?"} m); a temperatura é do ar a 2 m, não da planta; fases das culturas e limiares são hipóteses a calibrar; o ajuste de baixada é uma hipótese (+1 °C) e o relevo SRTM ainda não classifica cada talhão; isto não é previsão do tempo. Ferramenta de apoio: a decisão é do agricultor com o técnico.`,
              `Limitations: NASA POWER is a ~50 km grid (mean cell elevation: ${local.elevacaoGradeM ?? "?"} m); temperature is 2 m air temperature, not at the plant; crop stages and thresholds are hypotheses to calibrate; the lowland adjustment is a hypothesis (+1 °C) and SRTM relief does not yet classify each plot; this is not a weather forecast. A support tool: the decision belongs to the farmer together with the technician.`,
            )}
          </Fonte>
        </footer>
      </div>
    </LangContext.Provider>
  );
}
