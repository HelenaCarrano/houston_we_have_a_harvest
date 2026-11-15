"use client";

import type { CSSProperties } from "react";
import type { CampoView, DataView } from "@/lib/view-data";
import type { EngineParams } from "@/lib/engine/params.ts";
import type { TipoSegmento } from "@/lib/engine/calendario.ts";
import { ROTACOES } from "@/lib/rotacoes";
import { MESES_CURTOS, fmtDia, useLang, useT } from "@/lib/i18n";
import { SeloNivel } from "@/components/gt/Rotacoes";

const DIAS = 365;

const FUNDO: Record<TipoSegmento, CSSProperties> = {
  soja: { background: "var(--color-gt-soy)" },
  milho: { background: "var(--color-gt-gold)" },
  trigo: { background: "var(--color-gt-gold-dark)" },
  cobertura: {
    backgroundImage:
      "repeating-linear-gradient(135deg, var(--color-gt-soy) 0 5px, var(--color-gt-safe-bg) 5px 10px)",
  },
  descoberto: {
    backgroundImage:
      "repeating-linear-gradient(135deg, var(--color-gt-risk-line) 0 5px, var(--color-gt-risk-bg) 5px 10px)",
  },
};

export function CampoDescoberto({
  d,
  nomeLocal,
  params,
}: {
  d: DataView;
  nomeLocal: string;
  params: EngineParams;
}) {
  const t = useT();
  const lang = useLang();
  const meses = MESES_CURTOS[lang];
  const mesPlantio = Number(d.dataSoja.slice(0, 2)) - 1;
  const eixo = Array.from({ length: 12 }, (_, i) => meses[(mesPlantio + i) % 12]);

  const rotulo = (tipo: TipoSegmento) =>
    ({
      soja: t("Soja", "Soybean"),
      milho: t("Milho", "Corn"),
      trigo: t("Trigo", "Wheat"),
      cobertura: t("Braquiária", "Brachiaria"),
      descoberto: t("sem cultura", "no crop"),
    })[tipo];

  /** Meses com 10 dias ou mais sem cultura, ex.: "Jul (31 d), Aug (31 d)". */
  const mesesSemCultura = (c: CampoView) =>
    c.diasPorMes
      .map((n, i) => ({ n, i }))
      .filter((x) => x.n >= 10)
      .map((x) => `${meses[x.i]} (${x.n} ${t("d", "d")})`)
      .join(", ");

  return (
    <section className="gt-rise rounded-[22px] border border-gt-line bg-gt-card p-4 sm:p-6">
      <p className="text-xs font-semibold text-gt-faint">
        {t("Campo descoberto ao longo do ano", "Bare field through the year")} · {nomeLocal} · {t("soja em", "soybean on")}{" "}
        {fmtDia(d.dataSoja, lang)}
      </p>
      <h2 className="mt-1 text-2xl font-black">
        {t("Quando o campo fica sem cultura?", "When is the field left without a crop?")}
      </h2>
      <p className="mt-1 text-sm text-gt-muted">
        {t(
          "Cada linha vai do plantio desta soja até o plantio da próxima. Sem cultura = só resíduo de palha no solo.",
          "Each row runs from this soybean planting to the next one. No crop = only crop residue left on the soil.",
        )}
      </p>

      {/* eixo dos meses, começando no mês do plantio */}
      <div className="mt-4 flex font-mono text-[10px] text-gt-faint" aria-hidden="true">
        {eixo.map((m, i) => (
          <span key={`${m}-${i}`} className="flex-1 text-center">
            {m}
          </span>
        ))}
      </div>

      <ul className="mt-1 flex flex-col gap-5">
        {ROTACOES.map((r) => {
          const c = d.campo[r.id];
          const x = lang === "en" ? r.en : r.pt;
          const meses10 = mesesSemCultura(c);
          return (
            <li key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[15px] font-extrabold">{x.nome}</h3>
                <SeloNivel nivel={c.nivelErosao} rotulo={t("Erosão", "Erosion")} />
              </div>
              <div
                className="relative mt-1.5 h-9 overflow-hidden rounded-lg border border-gt-line bg-gt-card2"
                role="img"
                aria-label={t(
                  `${x.nome}: ${c.diasDescoberto} dias do ano sem cultura`,
                  `${x.nome}: ${c.diasDescoberto} days a year without a crop`,
                )}
              >
                {c.segmentos.map((s) => {
                  const largura = ((s.ate - s.de) / DIAS) * 100;
                  return (
                    <div
                      key={`${s.tipo}-${s.de}`}
                      className="absolute inset-y-0 flex items-center overflow-hidden"
                      style={{ left: `${(s.de / DIAS) * 100}%`, width: `${largura}%`, ...FUNDO[s.tipo] }}
                    >
                      {largura >= 11 && (
                        <span
                          className={`truncate px-1.5 text-[11px] font-extrabold ${
                            s.tipo === "milho" || s.tipo === "trigo" ? "text-gt-bg" : "text-gt-text"
                          }`}
                        >
                          {rotulo(s.tipo)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 text-sm">
                <b>{c.diasDescoberto}</b> {t("dias do ano sem cultura", "days a year without a crop")}
                {c.diasDescoberto > params.toleranciaCobertoDias
                  ? meses10
                    ? ` ${t("— sobretudo em", "— mostly in")} ${meses10}.`
                    : "."
                  : ` ${t("— praticamente sempre coberto.", "— practically always covered.")}`}
                {c.chuva && c.diasDescoberto > params.toleranciaCobertoDias && (
                  <>
                    {" "}
                    {t(
                      `Nesses dias chovem em média ${c.chuva.mediaMm} mm por ano e há ${String(c.chuva.diasChuvaForteAno).replace(".", ",")} dia(s) por ano com chuva de ${params.chuvaForteMm} mm ou mais (grade da NASA POWER, ${c.chuva.anos} anos).`,
                      `On those days it rains ${c.chuva.mediaMm} mm a year on average, with ${c.chuva.diasChuvaForteAno} day(s) a year of ${params.chuvaForteMm} mm or more (NASA POWER grid, ${c.chuva.anos} years).`,
                    )}
                  </>
                )}
              </p>
              {c.atrasoSojaDias > 0 && (
                <p className="mt-1 rounded-lg border border-gt-risk-line bg-gt-risk-bg p-2 text-sm text-gt-risk-text">
                  {t(
                    `⚠️ Com a semeadura do trigo em ${fmtDia(params.semeaduraTrigo, lang)} (valor de exemplo), a colheita passa ${c.atrasoSojaDias} dia(s) da data de plantio da próxima soja.`,
                    `⚠️ With wheat sown on ${fmtDia(params.semeaduraTrigo, lang)} (example value), harvest runs ${c.atrasoSojaDias} day(s) past the next soybean planting date.`,
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-gt-faint">
        {(["soja", "milho", "trigo", "cobertura", "descoberto"] as const).map((tipo) => (
          <span key={tipo} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-sm border border-gt-line" style={FUNDO[tipo]} />
            {tipo === "cobertura"
              ? t("braquiária (cobertura viva e palha)", "brachiaria (living cover, then straw)")
              : tipo === "descoberto"
                ? t("sem cultura (só palha)", "no crop (residue only)")
                : rotulo(tipo)}
          </span>
        ))}
      </p>

      <div className="mt-3 flex flex-col gap-1">
        <p className="text-xs leading-relaxed text-gt-faint">
          {t(
            `Hipóteses a validar com agronomia/ZARC: soja ${params.cicloSoja} dias, intervalo ${params.intervalo} dias, milho ${params.cicloMilho} dias, trigo semeado em ${fmtDia(params.semeaduraTrigo, lang)} com ${params.cicloTrigo} dias de ciclo. Como os ciclos são fixos, os dias sem cultura são os mesmos para qualquer data da soja; o que muda é em quais meses eles caem.`,
            `Hypotheses to validate with agronomy/ZARC: soybean ${params.cicloSoja} days, ${params.intervalo}-day gap, corn ${params.cicloMilho} days, wheat sown on ${fmtDia(params.semeaduraTrigo, lang)} with a ${params.cicloTrigo}-day cycle. Because cycles are fixed, the days without a crop are the same for any soybean date; what changes is which months they fall in.`,
          )}
        </p>
        <p className="text-xs leading-relaxed text-gt-faint">
          {t(
            `Nível de erosão (Metodologia do time): mais de ${params.limiteErosaoAltaDias} dias sem cultura = Alto; até ${params.toleranciaCobertoDias} = Baixo; entre os dois = Médio. Não considera o declive do terreno nem o mês da chuva, e a chuva é a média da grade de ~50 km, que subestima temporais locais.`,
            `Erosion level (team methodology): more than ${params.limiteErosaoAltaDias} days without a crop = High; up to ${params.toleranciaCobertoDias} = Low; in between = Medium. It ignores terrain slope and the month of the rain, and rainfall is the ~50 km grid average, which understates local storms.`,
          )}
        </p>
      </div>
    </section>
  );
}
