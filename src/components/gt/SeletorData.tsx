"use client";

import { useRef } from "react";
import { CalendarDays } from "lucide-react";
import type { DataView } from "@/lib/view-data";
import { Fonte } from "@/components/ui/Fonte";
import { fmtDia, useLang, useT } from "@/lib/i18n";

/** Seletor de data de plantio da soja: cada data mostra o risco (barras de geada e seca). */
export function SeletorData({
  datas,
  idx,
  onIdx,
  baixada,
  mensagemFiltro,
}: {
  datas: DataView[];
  idx: number;
  onIdx: (i: number) => void;
  baixada: boolean;
  mensagemFiltro?: string;
}) {
  const t = useT();
  const lang = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const g = (d: DataView) => (baixada ? d.geadaBaixada : d.geada);
  const max = Math.max(...datas.map((d) => Math.max(g(d).frequencia, d.seca.frequencia)), 0.1);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(k)) return;
    e.preventDefault();
    const prox = Math.min(datas.length - 1, Math.max(0, idx + (k === "ArrowRight" || k === "ArrowDown" ? 1 : -1)));
    onIdx(prox);
    ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[prox]?.focus();
  };

  return (
    <div>
      <p className="flex items-center gap-2 text-base font-bold">
        <CalendarDays className="size-5 text-brand" aria-hidden="true" />
        {t("2. Quando vai plantar a soja?", "2. When will you plant soybeans?")}
      </p>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={t("Data de plantio da soja", "Soybean planting date")}
        onKeyDown={onKeyDown}
        className="mt-2 grid grid-flow-col auto-cols-[minmax(44px,1fr)] gap-1 overflow-x-auto pb-1"
      >
        {datas.map((d, i) => {
          const sel = i === idx;
          const [dd, mm] = [fmtDia(d.dataSoja, "pt").slice(0, 2), fmtDia(d.dataSoja, "pt").slice(3)];
          return (
            <button
              key={d.dataSoja}
              type="button"
              role="radio"
              aria-checked={sel}
              tabIndex={sel ? 0 : -1}
              onClick={() => onIdx(i)}
              aria-label={t(
                `Soja em ${fmtDia(d.dataSoja, lang)}: geada ${g(d).anosComEvento} de ${g(d).totalAnos}, seca ${d.seca.anosComEvento} de ${d.seca.totalAnos}`,
                `Soybean on ${fmtDia(d.dataSoja, lang)}: frost ${g(d).anosComEvento} of ${g(d).totalAnos}, drought ${d.seca.anosComEvento} of ${d.seca.totalAnos}`,
              )}
              className={`flex h-[88px] flex-col sm:h-24 rounded-lg px-1 pb-1 ${sel ? "bg-brand-soft ring-2 ring-brand" : "hover:bg-surface-2"}`}
            >
              <span className="flex h-12 items-end sm:h-14 justify-center gap-1" aria-hidden="true">
                <span
                  className="w-2 rounded-t-sm bg-frost motion-safe:transition-all motion-safe:duration-200"
                  style={{ height: `${(g(d).frequencia / max) * 100}%`, minHeight: 3 }}
                />
                <span
                  className="w-2 rounded-t-sm bg-drought motion-safe:transition-all motion-safe:duration-200"
                  style={{ height: `${(d.seca.frequencia / max) * 100}%`, minHeight: 3 }}
                />
              </span>
              <span
                className={`mt-auto flex flex-col items-center text-[13px] leading-tight tabular-nums ${
                  sel ? "font-bold text-brand" : "text-ink"
                }`}
                aria-hidden="true"
              >
                {lang === "en" ? (
                  <>
                    <span>{fmtDia(d.dataSoja, "en").split(" ")[0]}</span>
                    <span>{fmtDia(d.dataSoja, "en").split(" ")[1]}</span>
                  </>
                ) : (
                  <span>
                    {dd}/{mm}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <Fonte className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-frost" aria-hidden="true" />
          {t("geada", "frost")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-drought" aria-hidden="true" />
          {t("seca", "drought")}
        </span>
        <span>{t("Barras: em quantos anos o milho pegou cada evento.", "Bars: in how many years the corn met each event.")}</span>
      </Fonte>
      {mensagemFiltro && <Fonte className="mt-2">{mensagemFiltro}</Fonte>}
    </div>
  );
}
