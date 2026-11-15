"use client";

import { useMemo, useState } from "react";
import type { DataView, LocalView, ViewData } from "@/lib/view-data";
import { Rotacoes } from "@/components/gt/Rotacoes";
import { Previsao } from "@/components/gt/Previsao";
import { Resposta } from "@/components/gt/Resposta";
import { PainelLavoura } from "@/components/gt/PainelLavoura";
import { BarraContexto } from "@/components/gt/BarraContexto";
import { TopBar } from "@/components/gt/TopBar";
import { Rodape } from "@/components/gt/Rodape";
import { Evidencias } from "@/components/gt/Evidencias";
import { FILTROS_ENSO } from "@/components/gt/format";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { LangContext, fmtDia } from "@/lib/i18n";
import { useIdioma } from "@/lib/useIdioma";
import type { FaseEnso, FiltroEnso } from "@/lib/engine/enso.ts";
import { Languages } from "lucide-react";

export function GroundTruthApp({ data }: { data: ViewData }) {
  const { lang, setLang, sugerirPt } = useIdioma();
  const t = (pt: string, en: string) => (lang === "en" ? en : pt);

  const [localId, setLocalId] = useState(data.locais[0].id);
  /** Municípios escolhidos pelo usuário (dados da NASA baixados na hora), além dos 3 de demonstração. */
  const [extras, setExtras] = useState<LocalView[]>([]);
  const locais = useMemo(() => [...data.locais, ...extras], [data, extras]);
  const local = useMemo(() => locais.find((l) => l.id === localId) ?? locais[0], [locais, localId]);
  const [idx, setIdx] = useState(Math.max(local.datas.findIndex((d) => d.dataSoja === "10-20"), 0));
  const [baixada, setBaixada] = useState(false);
  const [fase, setFase] = useState<FiltroEnso>("todos");
  const d = local.datas[idx]; // todos os anos
  const p = data.params;
  // Resultados considerando só os anos da fase escolhida do ENSO ("todos" = sem filtro).
  const dEf: DataView = { ...d, ...d.enso[fase] };
  const datasEf: DataView[] = local.datas.map((x) => ({ ...x, ...x.enso[fase] }));
  const nomeFase = (f: FiltroEnso) => {
    const x = FILTROS_ENSO.find((q) => q.id === f)!;
    return t(x.pt, x.en);
  };
  const anosDaFase = fase === "todos" ? [] : d.anosPorFase[fase as FaseEnso];
  const filtroTexto = fase === "todos" ? "" : `${nomeFase(fase)} (${anosDaFase.length})`;

  return (
    <LangContext.Provider value={lang}>
      <TopBar lang={lang} setLang={setLang} />
      <BarraContexto
        nome={local.nome}
        data={fmtDia(d.dataSoja, lang)}
        baixada={baixada}
        filtro={filtroTexto}
      />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {sugerirPt && lang === "en" && (
          <div role="region" aria-label="Idioma" className="mt-4">
            <Callout tom="info" icone={Languages}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>This app is in English. / Este app está em inglês.</span>
                <Button onClick={() => setLang("pt")} lang="pt">
                  Ver em português
                </Button>
              </div>
            </Callout>
          </div>
        )}

        <div className="pb-4 pt-6">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-4xl">
            {t(
              "Quando plantar a soja para proteger o milho safrinha?",
              "When should I plant soybeans to protect my second-crop corn?",
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            {t(
              `Veja em quantos dos últimos ${d.geada.totalAnos} anos o milho safrinha pegou geada ou seca, conforme a data da soja. Dados diários da NASA desde 1981.`,
              `See in how many of the last ${d.geada.totalAnos} years second-crop corn met frost or drought, depending on the soybean date. NASA daily data since 1981.`,
            )}
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <PainelLavoura
            locais={locais}
            localId={local.id}
            onLocal={setLocalId}
            onAdicionarLocal={(l) => setExtras((xs) => (xs.some((x) => x.id === l.id) ? xs : [...xs, l]))}
            datas={datasEf}
            idx={idx}
            onIdx={setIdx}
            baixada={baixada}
            onBaixada={setBaixada}
            fase={fase}
            onFase={setFase}
            d={d}
            ensoInfo={data.enso}
            params={p}
            indiceEnso={data.indiceEnso}
            local={local}
          />

          <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
            <Resposta
              local={local}
              d={d}
              dEf={dEf}
              datasEf={datasEf}
              idx={idx}
              onIdx={setIdx}
              baixada={baixada}
              filtroTexto={filtroTexto}
            />
            <Previsao
              key={local.id}
              nome={local.nome}
              lat={local.lat}
              lon={local.lon}
              baixada={baixada}
              limiteGeadaC={p.limiteGeadaC}
              ajusteBaixadaC={p.ajusteBaixadaC}
            />
            <Rotacoes d={dEf} trigo={local.trigo} nomeLocal={local.nome} baixada={baixada} filtroRotulo={filtroTexto} />
            <Evidencias
              local={local}
              d={d}
              dEf={dEf}
              baixada={baixada}
              filtroTexto={filtroTexto}
              params={p}
              backtest={data.backtest}
            />
          </div>
        </div>

        <Rodape local={local} />
      </div>
    </LangContext.Provider>
  );
}
