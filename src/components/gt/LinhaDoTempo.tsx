"use client";

import { Snowflake } from "lucide-react";
import type { DataView, LocalView } from "@/lib/view-data";
import { MESES_EIXO, fmtDia, useLang, useT } from "@/lib/i18n";

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

export function LinhaDoTempo({ d, local }: { d: DataView; local: LocalView }) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const ep = local.epocaGeada;
  return (
    <div>
      <div className="relative h-28 select-none" aria-hidden="true">
        {ep && (
          <div
            className="absolute top-0 bottom-6 rounded-lg border border-dashed border-frost bg-frost-soft"
            style={{ left: pct(ep.inicio), width: larg(ep.inicio, ep.fim) }}
          >
            <span className="absolute right-1 top-1 inline-flex items-center gap-1 text-[13px] text-frost-ink">
              <Snowflake className="size-4" /> {t("geada", "frost")}
            </span>
          </div>
        )}
        <div
          className="absolute top-4 h-7 rounded-lg bg-soy motion-safe:transition-all motion-safe:duration-200"
          style={{ left: pct(d.dataSoja), width: larg(d.dataSoja, d.colheitaSoja) }}
        >
          <span className="px-2 text-sm font-bold leading-7 text-white">{t("Soja", "Soybean")}</span>
        </div>
        <div
          className="absolute top-13 h-7 rounded-lg bg-corn motion-safe:transition-all motion-safe:duration-200"
          style={{ left: pct(d.plantioMilho), width: larg(d.plantioMilho, d.faseFim) }}
        >
          <span className="whitespace-nowrap px-2 text-sm font-bold leading-7 text-ink">{t("Milho", "Corn")}</span>
        </div>
        <div
          className="absolute top-12 h-9 rounded-lg border-2 border-ink motion-safe:transition-all motion-safe:duration-200"
          style={{ left: pct(d.faseInicio), width: larg(d.faseInicio, d.faseFim) }}
        />
        <div className="absolute bottom-0 left-0 right-0 flex border-t border-line">
          {MESES_EIXO[lang].map((m) => (
            <span
              key={m}
              className="flex-1 pt-1 text-center text-[13px] text-ink-faint max-sm:[&:nth-child(even)]:invisible"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-ink-muted">{t("Plantio soja", "Soybean planting")}</dt>
          <dd className="font-bold">{dia(d.dataSoja)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">{t("Plantio milho", "Corn planting")}</dt>
          <dd className="font-bold">{dia(d.plantioMilho)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-ink-muted">
            <span className="inline-block size-3 rounded-sm border-2 border-ink" aria-hidden="true" />
            {t("Floração e enchimento", "Critical stage")}
          </dt>
          <dd className="font-bold">
            {dia(d.faseInicio)}–{dia(d.faseFim)}
          </dd>
        </div>
        {ep && (
          <div>
            <dt className="text-frost-ink">{t("Época de geada", "Frost season")}</dt>
            <dd className="font-bold">
              {dia(ep.inicio)}–{dia(ep.fim)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
