"use client";

import type { DataView } from "@/lib/view-data";
import { diaLongo, emDez, fraseDez } from "@/components/wh/modelo";
import { fmtDia, useLang, useT } from "@/lib/i18n";

/** Cor de cada data pela geada (anos em 10): verde = pouca, laranja = muita. */
export function corGeada(n: number): string {
  return n <= 1 ? "#7CC46A" : n === 2 ? "#A8D88F" : n === 3 ? "#F2C46A" : "#E9A17A";
}

function Seta({ dir }: { dir: "esq" | "dir" }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14231A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "esq" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

/** Escolha da data de plantio: dia grande com setas e uma régua para arrastar, colorida pelo risco de geada. */
export function SeletorDia({
  datas,
  idx,
  onIdx,
  baixada,
  titulo,
}: {
  datas: DataView[];
  idx: number;
  onIdx: (i: number) => void;
  baixada: boolean;
  titulo: string;
}) {
  const t = useT();
  const lang = useLang();
  const g = (x: DataView) => (baixada ? x.geadaBaixada : x.geada);
  const d = datas[idx];
  const n = datas.length;
  const pos = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 0);
  // marcas de mês: primeira data de cada mês
  const marcas = datas
    .map((x, i) => ({ i, m: x.dataSoja.slice(0, 2) }))
    .filter((x, k, arr) => k === 0 || arr[k - 1].m !== x.m);
  const MESES = lang === "en" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  return (
    <div className="flex flex-col gap-2.5">
      <span id="wh-q-data" className="text-base font-extrabold">
        {titulo}
      </span>
      <div className="flex items-center gap-2 rounded-2xl bg-campo p-1.5">
        <button
          type="button"
          aria-label={t("Data anterior", "Earlier date")}
          disabled={idx === 0}
          onClick={() => onIdx(idx - 1)}
          className="flex size-12 flex-none cursor-pointer items-center justify-center rounded-xl border-none bg-white disabled:opacity-40"
        >
          <Seta dir="esq" />
        </button>
        <div className="flex flex-1 flex-col items-center" aria-live="polite">
          <span className="text-[22px] font-black leading-tight">{diaLongo(d.dataSoja, lang)}</span>
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-texto-2">
            <span className="size-2.5 rounded-full" style={{ background: corGeada(emDez(g(d)).n) }} />
            {t(`geada em ${fraseDez(g(d), lang)}`, `frost in ${fraseDez(g(d), lang)}`)}
          </span>
        </div>
        <button
          type="button"
          aria-label={t("Data seguinte", "Later date")}
          disabled={idx === n - 1}
          onClick={() => onIdx(idx + 1)}
          className="flex size-12 flex-none cursor-pointer items-center justify-center rounded-xl border-none bg-white disabled:opacity-40"
        >
          <Seta dir="dir" />
        </button>
      </div>
      <div className="relative px-3.5 pt-1">
        <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
          {datas.map((x) => (
            <span key={x.dataSoja} className="h-full flex-1" style={{ background: corGeada(emDez(g(x)).n) }} />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={n - 1}
          step={1}
          value={idx}
          onChange={(e) => onIdx(Number(e.target.value))}
          aria-labelledby="wh-q-data"
          aria-valuetext={`${fmtDia(d.dataSoja, lang)} · ${t(`geada em ${fraseDez(g(d), lang)}`, `frost in ${fraseDez(g(d), lang)}`)}`}
          className="wh-range absolute inset-x-0 -top-2 h-11 w-full"
        />
        <div className="relative mt-2 h-4 text-[13px] font-bold text-texto-2" aria-hidden="true">
          {marcas.map((x) => (
            <span key={x.i} className="absolute -translate-x-1/2" style={{ left: `${pos(x.i)}%` }}>
              {MESES[Number(x.m) - 1]}
            </span>
          ))}
        </div>
      </div>
      <span className="text-[13px] text-texto-2">
        {t("Arraste ou use as setas. Verde = menos geada no milho.", "Drag or use the arrows. Green = less frost on the corn.")}
      </span>
    </div>
  );
}
