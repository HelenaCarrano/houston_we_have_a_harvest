"use client";

import { useState } from "react";
import { MapPin, Mountain, Search } from "lucide-react";
import type { DataView, EnsoInfo, LocalView } from "@/lib/view-data";
import type { EngineParams } from "@/lib/engine/index.ts";
import type { FaseEnso, FiltroEnso, IndiceEnso } from "@/lib/engine/enso.ts";
import { Card } from "@/components/ui/Card";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Segmented } from "@/components/ui/Segmented";
import { Switch } from "@/components/ui/Switch";
import { Disclosure } from "@/components/ui/Disclosure";
import { Callout } from "@/components/ui/Callout";
import { Fonte } from "@/components/ui/Fonte";
import { EscolherLugar } from "@/components/gt/EscolherLugar";
import { SeletorData } from "@/components/gt/SeletorData";
import { AMOSTRA_MINIMA, FILTROS_ENSO } from "@/components/gt/format";
import { TriangleAlert } from "lucide-react";
import { TRIMESTRE_MESES, fmtData, fmtNum, useLang, useT } from "@/lib/i18n";

export function PainelLavoura({
  locais,
  localId,
  onLocal,
  onAdicionarLocal,
  datas,
  idx,
  onIdx,
  baixada,
  onBaixada,
  fase,
  onFase,
  d,
  ensoInfo,
  params,
  indiceEnso,
  local,
}: {
  locais: LocalView[];
  localId: string;
  onLocal: (id: string) => void;
  onAdicionarLocal: (l: LocalView) => void;
  datas: DataView[];
  idx: number;
  onIdx: (i: number) => void;
  baixada: boolean;
  onBaixada: (b: boolean) => void;
  fase: FiltroEnso;
  onFase: (f: FiltroEnso) => void;
  d: DataView;
  ensoInfo: EnsoInfo;
  params: EngineParams;
  indiceEnso: IndiceEnso;
  local: LocalView;
}) {
  const t = useT();
  const lang = useLang();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [ensoAberto, setEnsoAberto] = useState(false);

  const anosDaFase = fase === "todos" ? [] : d.anosPorFase[fase as FaseEnso];
  const f = FILTROS_ENSO.find((q) => q.id === fase)!;
  const fraseFase = t(f.fpt, f.fen);
  const ult = ensoInfo.ultimo;
  const ultFaseNome =
    ult?.fase === "el-nino" ? "El Niño" : ult?.fase === "la-nina" ? "La Niña" : t("neutras", "neutral");

  return (
    <Card id="sua-lavoura" className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">{t("Sua lavoura", "Your field")}</h2>

      <div className="mt-3">
        <p className="flex items-center gap-2 text-base font-bold">
          <MapPin className="size-5 text-brand" aria-hidden="true" />
          {t("1. Onde fica sua lavoura?", "1. Where is your field?")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ChipGroup label={t("Município", "Municipality")} type="radio">
            {locais.map((l) => (
              <Chip key={l.id} selected={l.id === localId} onClick={() => onLocal(l.id)}>
                {l.nome}
              </Chip>
            ))}
          </ChipGroup>
          <Chip
            role="button"
            selected={false}
            tracejado
            expanded={buscaAberta}
            icon={<Search className="size-4" aria-hidden="true" />}
            onClick={() => setBuscaAberta((b) => !b)}
          >
            {t("Outro município", "Another municipality")}
          </Chip>
        </div>
        {buscaAberta && (
          <div className="mt-3">
            <EscolherLugar
              params={params}
              indiceEnso={indiceEnso}
              onLocal={(l) => {
                onAdicionarLocal(l);
                onLocal(l.id);
                setBuscaAberta(false);
              }}
            />
          </div>
        )}
        {local.personalizado && (
          <Fonte className="mt-2">
            {t(
              `Dados da NASA de ${local.nome}, baixados agora (grade de ~50 km). Confira a janela do ZARC do seu município. Sem comparação com 2026 e sem relevo.`,
              `NASA data for ${local.nome}, downloaded just now (~50 km grid). Check your municipality's ZARC window. No 2026 comparison and no relief.`,
            )}
          </Fonte>
        )}
      </div>

      <div className="mt-3 border-t border-line pt-3 sm:mt-4 sm:pt-4">
        <SeletorData
          datas={datas}
          idx={idx}
          onIdx={onIdx}
          baixada={baixada}
          mensagemFiltro={
            fase !== "todos"
              ? t(
                  `Gráfico e recomendação calculados só com os ${fraseFase}; o número de anos muda de uma data para outra.`,
                  `Chart and recommendation use only the ${fraseFase}; the number of years differs from one date to another.`,
                )
              : undefined
          }
        />
      </div>

      <div className="mt-3 border-t border-line pt-3 sm:mt-4 sm:pt-4">
        <Switch
          checked={baixada}
          onChange={onBaixada}
          icone={<Mountain className="size-5 text-brand" aria-hidden="true" />}
          label={t("Lavoura em baixada", "Field in a lowland")}
          hint={t(
            "Fundo de vale, onde o ar frio se acumula. Aumenta o risco de geada.",
            "Valley floor where cold air pools. Raises frost risk.",
          )}
        />
      </div>

      <div className="mt-3 border-t border-line pt-3 sm:mt-4 sm:pt-4">
        <Disclosure
          open={ensoAberto}
          onToggle={setEnsoAberto}
          titulo={t("Ver só anos de El Niño ou La Niña", "See only El Niño or La Niña years")}
          subtitulo={
            fase === "todos"
              ? t("Usando todos os anos", "Using all years")
              : t(`Usando só ${fraseFase} (${anosDaFase.length})`, `Using only ${fraseFase} (${anosDaFase.length})`)
          }
        >
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-ink-muted">
              {t(
                "El Niño e La Niña são mudanças na temperatura do Oceano Pacífico que alteram o frio e a chuva no Sul do Brasil. Escolha uma opção para contar só os anos parecidos. O app não prevê qual fase virá.",
                "El Niño and La Niña are changes in Pacific Ocean temperature that alter cold and rain in southern Brazil. Pick one to count only similar years. The app does not predict which phase is coming.",
              )}
            </p>
            <Segmented<FiltroEnso>
              label={t("Anos a considerar", "Years to consider")}
              value={fase}
              onChange={onFase}
              cols={2}
              redondo={false}
              options={FILTROS_ENSO.map((q) => ({
                id: q.id,
                label: t(q.pt, q.en),
                sub: `(${q.id === "todos" ? d.geada.totalAnos : d.anosPorFase[q.id].length})`,
              }))}
            />
            {fase !== "todos" && (
              <p className="text-ink-muted">
                <b className="text-ink">{t("Anos contados:", "Years counted:")}</b> {anosDaFase.join(", ")}.
              </p>
            )}
            {fase !== "todos" && anosDaFase.length < AMOSTRA_MINIMA && (
              <Callout tom="cautela" icone={TriangleAlert}>
                {t(
                  `Poucos anos (${anosDaFase.length}): um ano a mais ou a menos muda bastante o resultado. Leia com cautela.`,
                  `Few seasons (${anosDaFase.length}): one more or one fewer year changes the result a lot. Read with caution.`,
                )}
              </Callout>
            )}
            {ult && (
              <p className="text-ink-muted">
                {t(
                  `Hoje a NOAA indica condições ${ultFaseNome === "El Niño" ? "de El Niño" : ultFaseNome === "La Niña" ? "de La Niña" : "neutras"} (última leitura, ${TRIMESTRE_MESES[ult.trimestre]?.pt ?? ult.trimestre}/${ult.ano}: ${ult.valor > 0 ? "+" : ""}${fmtNum(ult.valor, 2, lang)}). É a leitura mais recente, não uma previsão da próxima safra.`,
                  `Today NOAA indicates ${ultFaseNome} conditions (latest reading, ${TRIMESTRE_MESES[ult.trimestre]?.en ?? ult.trimestre} ${ult.ano}: ${ult.valor > 0 ? "+" : ""}${fmtNum(ult.valor, 2, lang)}). It is the most recent reading, not a forecast for the coming season.`,
                )}{" "}
                <a
                  className="text-brand underline underline-offset-2"
                  href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Previsão da NOAA", "NOAA outlook")}
                </a>
                .
              </p>
            )}
            <p className="font-semibold">{t("Como classificamos (técnico)", "How we classify (technical)")}</p>
            <Fonte>
              {t(
                "Fase de cada safra = RONI da NOAA (índice oficial do ENSO) no trimestre do meio da floração e enchimento do milho; ≥ +0,5 = El Niño, ≤ −0,5 = La Niña. Regra simplificada (a NOAA exige 5 trimestres seguidos para declarar um episódio). O ONI antigo classificaria cerca de 15% dos trimestres de outra forma. Limites de seca continuam calculados com todos os anos.",
                "Phase of each season = NOAA's RONI (official ENSO index) in the 3-month season at the middle of the corn critical stage; ≥ +0.5 = El Niño, ≤ −0.5 = La Niña. Simplified rule (NOAA requires 5 consecutive seasons to declare an episode). The older ONI would classify about 15% of seasons differently. Drought limits are still computed with all years.",
              )}{" "}
              {t("Dados baixados em", "Data downloaded on")} {fmtData(ensoInfo.baixadoEm.slice(0, 10), lang)}.{" "}
              <a href={ensoInfo.url} target="_blank" rel="noreferrer">
                {t("Fonte", "Source")}
              </a>
              .
            </Fonte>
          </div>
        </Disclosure>
      </div>
    </Card>
  );
}
