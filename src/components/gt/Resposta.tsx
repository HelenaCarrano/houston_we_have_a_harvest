"use client";

import { CircleCheck, Info, Lightbulb, OctagonAlert, Snowflake, SunDim, TriangleAlert } from "lucide-react";
import type { DataView, LocalView, RiscoView } from "@/lib/view-data";
import type { EngineParams } from "@/lib/engine/index.ts";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { DotArray } from "@/components/ui/DotArray";
import { Fonte } from "@/components/ui/Fonte";
import { NivelBadge, nivelPorFreq, type Nivel } from "@/components/ui/NivelBadge";
import { LinhaDoTempo } from "@/components/gt/LinhaDoTempo";
import { deCada10, numeroGrande, pontos10 } from "@/components/gt/format";
import { fmtDia, useLang, useT } from "@/lib/i18n";

const PESO: Record<Nivel, number> = { Baixo: 0, Médio: 1, Alto: 2 };

function MetricTile({ tipo, titulo, r }: { tipo: "geada" | "seca"; titulo: string; r: RiscoView }) {
  const t = useT();
  const lang = useLang();
  const Icone = tipo === "geada" ? Snowflake : SunDim;
  const cor = tipo === "geada" ? "text-frost" : "text-drought";
  const x = deCada10(r, lang);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 font-bold">
        <Icone className={`size-5 ${cor}`} aria-hidden="true" />
        {titulo}
      </p>
      <p className={`text-5xl font-extrabold leading-none tabular-nums ${cor}`}>
        {numeroGrande(r, lang)}
        <span className="ml-2 text-lg font-semibold text-ink-muted">{t(" em 10 anos", " in 10 years").trim()}</span>
      </p>
      <DotArray preenchidos={pontos10(r)} cor={tipo === "geada" ? "frost" : "drought"} rotulo={x.frase} />
      <p className="text-sm text-ink-muted">
        {t(
          `${r.anosComEvento} de ${r.totalAnos} safras${r.periodo ? ` (${r.periodo[0]}–${r.periodo[1]})` : ""}`,
          `${r.anosComEvento} of ${r.totalAnos} seasons${r.periodo ? ` (${r.periodo[0]}–${r.periodo[1]})` : ""}`,
        )}
      </p>
      <div>
        <NivelBadge nivel={r.nivel} />
      </div>
    </div>
  );
}

export function Resposta({
  local,
  d,
  dEf,
  datasEf,
  idx,
  onIdx,
  baixada,
  filtroTexto,
}: {
  local: LocalView;
  /** Data escolhida, todos os anos (linha do tempo). */
  d: DataView;
  /** Data escolhida, com o filtro de ENSO. */
  dEf: DataView;
  datasEf: DataView[];
  idx: number;
  onIdx: (i: number) => void;
  baixada: boolean;
  filtroTexto: string;
  params?: EngineParams;
}) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const g = (x: DataView) => (baixada ? x.geadaBaixada : x.geada);
  const geada = g(dEf);
  const seca = dEf.seca;
  const total = geada.totalAnos;

  const nGeada = nivelPorFreq(geada.frequencia);
  const nSeca = nivelPorFreq(seca.frequencia);
  const pior: Nivel = PESO[nGeada] >= PESO[nSeca] ? nGeada : nSeca;
  const VEREDITO = {
    Alto: {
      cls: "border-high-strong bg-high-soft",
      Icone: OctagonAlert,
      cor: "text-high",
      pt: "Risco alto para o milho safrinha",
      en: "High risk for second-crop corn",
    },
    Médio: {
      cls: "border-mid-line bg-mid-soft",
      Icone: TriangleAlert,
      cor: "text-mid",
      pt: "Risco moderado para o milho safrinha",
      en: "Moderate risk for second-crop corn",
    },
    Baixo: {
      cls: "border-low bg-low-soft",
      Icone: CircleCheck,
      cor: "text-low",
      pt: "Risco baixo para o milho safrinha",
      en: "Low risk for second-crop corn",
    },
  }[pior];

  // melhor data (só geada): mesma lógica de antes
  const minG = Math.min(...datasEf.map((x) => g(x).anosComEvento));
  let ate = 0;
  datasEf.forEach((x, i) => {
    if (g(x).anosComEvento === minG) ate = i;
  });
  const alvo = datasEf[ate];
  const sel = datasEf[idx];
  const ok = idx <= ate;

  const eyebrow = `${local.nome} · ${t("soja em", "soybean on")} ${dia(dEf.dataSoja)}${baixada ? ` · ${t("baixada", "lowland")}` : ""}${filtroTexto ? ` · ${filtroTexto}` : ""}`;

  return (
    <Card id="resposta" className="flex flex-col gap-4">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">{eyebrow}</p>

      <div className={`rounded-xl border-l-[6px] p-4 ${VEREDITO.cls}`} aria-live="polite">
        <div className="flex items-start gap-3">
          <VEREDITO.Icone className={`mt-0.5 size-6 shrink-0 ${VEREDITO.cor}`} aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">{t(VEREDITO.pt, VEREDITO.en)}</h2>
            <p className="mt-2 text-base">
              {t(
                `Nos últimos ${total} anos, com a soja em ${dia(dEf.dataSoja)}, o milho pegou geada em ${deCada10(geada, lang).frase} e seca em ${deCada10(seca, lang).frase}.`,
                `Over the last ${total} years, with soybeans on ${dia(dEf.dataSoja)}, the corn met frost in ${deCada10(geada, lang).frase} and drought in ${deCada10(seca, lang).frase}.`,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          tipo="geada"
          r={geada}
          titulo={baixada ? t("Geada no milho (baixada)", "Frost on the corn (lowland)") : t("Geada no milho", "Frost on the corn")}
        />
        <MetricTile tipo="seca" r={seca} titulo={t("Seca no milho", "Drought on the corn")} />
      </div>

      <Callout tom="info" icone={Info} className="text-sm">
        <p>
          {t(
            "É quantas vezes o evento aconteceu nos anos passados — não é quanto da lavoura você perde.",
            "This is how often the event happened in past years — not how much of the crop you would lose.",
          )}
        </p>
      </Callout>

      <div>
        <h3 className="mb-2 text-lg font-bold">{t("Calendário da safra", "Crop calendar")}</h3>
        <LinhaDoTempo d={d} local={local} />
      </div>

      <Callout tom={ok ? "positivo" : "info"} icone={Lightbulb}>
        <p>
          {ok
            ? t(
                `Pensando só na geada, ${dia(sel.dataSoja)} já está entre as melhores datas: ${deCada10(g(sel), lang).frase} (${g(sel).anosComEvento} de ${g(sel).totalAnos} safras).`,
                `Looking at frost only, ${dia(sel.dataSoja)} is already among the best dates: ${deCada10(g(sel), lang).frase} (${g(sel).anosComEvento} of ${g(sel).totalAnos} seasons).`,
              )
            : t(
                `Pensando só na geada, plantar a soja até ${dia(alvo.dataSoja)} reduz o risco para ${deCada10(g(alvo), lang).frase} (${g(alvo).anosComEvento} de ${g(alvo).totalAnos} safras). Na data escolhida foram ${g(sel).anosComEvento} de ${g(sel).totalAnos}.`,
                `Looking at frost only, planting soybeans by ${dia(alvo.dataSoja)} lowers the risk to ${deCada10(g(alvo), lang).frase} (${g(alvo).anosComEvento} of ${g(alvo).totalAnos} seasons). On the chosen date it was ${g(sel).anosComEvento} of ${g(sel).totalAnos}.`,
              )}
        </p>
        {!ok && (
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              onIdx(ate);
              document.getElementById("resposta")?.scrollIntoView({ block: "start" });
            }}
          >
            {t(`Ver com ${dia(alvo.dataSoja)}`, `Show ${dia(alvo.dataSoja)}`)}
          </Button>
        )}
      </Callout>
      <Fonte>
        {t(
          "Confira também a seca e a janela do ZARC do seu município (exigida para crédito e seguro). A decisão final é sua, com o técnico.",
          "Also check drought and your municipality’s ZARC window (required for credit and insurance). The final decision is yours, with your agronomist.",
        )}
      </Fonte>
    </Card>
  );
}
