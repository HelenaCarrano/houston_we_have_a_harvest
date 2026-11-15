"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { DataView, LocalView, ViewData } from "@/lib/view-data";
import type { Foco, Restricao } from "@/lib/rotacoes";
import type { FaseEnso, FiltroEnso } from "@/lib/engine/enso.ts";
import { EscolherLugar } from "@/components/gt/EscolherLugar";
import { FILTROS_ENSO } from "@/components/gt/format";
import { BarraAcoes, CabecalhoInicio, Folha } from "@/components/wh/Moldura";
import { VouPlantar } from "@/components/wh/VouPlantar";
import { JaPlantei } from "@/components/wh/JaPlantei";
import { TelaCalendario, type LembreteId } from "@/components/wh/TelaCalendario";
import { TelaRotacoes } from "@/components/wh/TelaRotacoes";
import { Detalhes } from "@/components/wh/Detalhes";
import { anoDaSafra, avaliarRotacoes, baixarIcs, dataNaSafra, diaEMes, diasEntre, montarResumo, type EventoAgenda } from "@/components/wh/modelo";
import { LangContext, fmtDia } from "@/lib/i18n";
import { useIdioma } from "@/lib/useIdioma";

type Tela = "inicio" | "calendario" | "rotacoes";
type FolhaAberta = null | "menu" | "municipio" | "data";

const semInscricao = () => () => {};
function isoDeHoje(): string {
  const x = new Date();
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export function GroundTruthApp({ data }: { data: ViewData }) {
  const { lang, setLang } = useIdioma();
  const t = (pt: string, en: string) => (lang === "en" ? en : pt);

  const [localId, setLocalId] = useState(data.locais[0].id);
  /** Municípios escolhidos pelo usuário (dados da NASA baixados na hora), além dos 3 de demonstração. */
  const [extras, setExtras] = useState<LocalView[]>([]);
  const locais = useMemo(() => [...data.locais, ...extras], [data, extras]);
  const local = useMemo(() => locais.find((l) => l.id === localId) ?? locais[0], [locais, localId]);
  const [idx, setIdx] = useState(Math.max(local.datas.findIndex((d) => d.dataSoja === "10-20"), 0));
  const [baixada, setBaixada] = useState(false);
  const [fase, setFase] = useState<FiltroEnso>("todos");
  const [foco, setFoco] = useState<Foco>("equilibrio");
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [modo, setModo] = useState<"vou" | "ja">("vou");
  const [tela, setTela] = useState<Tela>("inicio");
  const [folha, setFolha] = useState<FolhaAberta>(null);
  const [lembretes, setLembretes] = useState<Record<LembreteId, boolean>>({ soja: true, colheita: true, milho: true, flor: true });
  // Data de hoje só no navegador (a página é gerada no build).
  const hojeIso = useSyncExternalStore(semInscricao, isoDeHoje, () => null);
  const hoje = useMemo(() => (hojeIso ? new Date(`${hojeIso}T12:00:00`) : null), [hojeIso]);

  const p = data.params;
  const d = local.datas[idx]; // todos os anos
  const dEf: DataView = { ...d, ...d.enso[fase] };
  const datasEf: DataView[] = local.datas.map((x) => ({ ...x, ...x.enso[fase] }));
  const filtro = FILTROS_ENSO.find((q) => q.id === fase)!;
  const filtroTexto = fase === "todos" ? "" : `${t(filtro.pt, filtro.en)} (${d.anosPorFase[fase as FaseEnso].length})`;

  const modelo = avaliarRotacoes({ d: dEf, trigo: local.trigo, baixada, foco, restricoes, lang });
  const resumo = montarResumo({ nomeLocal: local.nome, d: dEf, baixada, modelo, lang });

  // Navegação entre telas com o botão "voltar" do celular.
  const irPara = useCallback((x: Tela) => {
    setTela(x);
    setFolha(null);
    if (x !== "inicio") window.history.pushState({ tela: x }, "");
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const aoVoltar = (e: PopStateEvent) => setTela((e.state?.tela as Tela) ?? "inicio");
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);
  const voltar = () => {
    if (window.history.state?.tela) window.history.back();
    else setTela("inicio");
  };
  const fecharFolha = useCallback(() => setFolha(null), []);

  const escolherLocal = (id: string) => {
    setLocalId(id);
    setFolha(null);
  };

  const salvarAgenda = () => {
    if (!hoje) return;
    const ano = anoDaSafra(hoje);
    const dt = (mmdd: string) => dataNaSafra(mmdd, ano);
    const nota = t(
      "Planejado com o weharvest (dados NASA POWER). Confirme com seu agrônomo.",
      "Planned with weharvest (NASA POWER data). Confirm with your agronomist.",
    );
    const todos: (EventoAgenda & { id: LembreteId })[] = [
      { id: "soja", titulo: t("Plantar a soja", "Plant soybeans"), inicio: dt(d.dataSoja), descricao: nota },
      { id: "colheita", titulo: t("Colher a soja (aprox.)", "Harvest soybeans (approx.)"), inicio: dt(d.colheitaSoja), descricao: nota },
      { id: "milho", titulo: t("Plantar o milho safrinha", "Plant second-crop corn"), inicio: dt(d.plantioMilho), descricao: nota },
      {
        id: "flor",
        titulo: t("Flor do milho: fase sensível a geada e seca", "Corn flowering: stage sensitive to frost and drought"),
        inicio: dt(d.faseInicio),
        fim: dt(d.faseFim),
        descricao: nota,
      },
    ];
    const eventos = todos.filter((e) => lembretes[e.id] && diasEntre(hoje, e.fim ?? e.inicio) >= 0);
    baixarIcs(eventos.length ? eventos : todos, `weharvest-safra-${ano}-${String(ano + 1).slice(2)}.ics`);
  };

  const detalhes = (
    <Detalhes
      local={local}
      d={d}
      dEf={dEf}
      baixada={baixada}
      fase={fase}
      onFase={setFase}
      filtroTexto={filtroTexto}
      params={p}
      backtest={data.backtest}
      enso={data.enso}
    />
  );

  const itemMenu =
    "flex min-h-[52px] w-full cursor-pointer items-center justify-between rounded-2xl border-none bg-white px-4 text-left text-base font-extrabold text-texto";

  return (
    <LangContext.Provider value={lang}>
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-palha">
        {tela === "inicio" && (
          <>
            {modo === "vou" ? (
              <CabecalhoInicio
                saudacao={t("Olá, produtor!", "Hello, farmer!")}
                titulo={t("Vamos proteger o seu milho safrinha?", "Shall we protect your second-crop corn?")}
                onMenu={() => setFolha("menu")}
              />
            ) : (
              <CabecalhoInicio
                ceu={false}
                saudacao={t("Soja na terra!", "Soybeans in the ground!")}
                titulo={t("Agora vamos cuidar do milho que vem depois", "Now let’s look after the corn that comes next")}
                onMenu={() => setFolha("menu")}
              />
            )}
            <main className={`relative flex flex-col gap-3.5 px-4 pb-[120px] ${modo === "vou" ? "-mt-[18px]" : "-mt-[22px]"}`}>
              {modo === "vou" ? (
                <VouPlantar
                  local={local}
                  datas={datasEf}
                  idx={idx}
                  onIdx={setIdx}
                  baixada={baixada}
                  onBaixada={setBaixada}
                  onTrocarLocal={() => setFolha("municipio")}
                  onModo={setModo}
                  onVerCalendario={() => irPara("calendario")}
                  detalhes={detalhes}
                />
              ) : (
                hoje && <JaPlantei
                  d={dEf}
                  baixada={baixada}
                  cicloSoja={p.cicloSoja}
                  hoje={hoje}
                  onModo={setModo}
                  onMudarData={() => setFolha("data")}
                  onRotacoes={() => irPara("rotacoes")}
                />
              )}
            </main>
            <BarraAcoes hrefWhatsApp={"https://wa.me/?text=" + encodeURIComponent(resumo)} onAgenda={salvarAgenda} />
          </>
        )}

        {tela === "calendario" && hoje && (
          <TelaCalendario
            local={local}
            d={dEf}
            baixada={baixada}
            cicloMilho={p.cicloMilho}
            hoje={hoje}
            lembretes={lembretes}
            onLembrete={(id) => setLembretes((x) => ({ ...x, [id]: !x[id] }))}
            onAgenda={salvarAgenda}
            onVoltar={voltar}
          />
        )}

        {tela === "rotacoes" && (
          <TelaRotacoes
            nomeLocal={local.nome}
            d={dEf}
            datas={datasEf}
            trigo={local.trigo}
            baixada={baixada}
            modelo={modelo}
            foco={foco}
            onFoco={setFoco}
            restricoes={restricoes}
            onRestricao={(k) => setRestricoes((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]))}
            onVoltar={voltar}
          />
        )}
      </div>

      {folha === "menu" && (
        <Folha titulo="Menu" onFechar={fecharFolha}>
          <div role="group" aria-label={t("Idioma", "Language")} className="grid grid-cols-2 gap-1 rounded-full bg-campo p-1">
            {(["pt", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={`min-h-[46px] cursor-pointer rounded-full border-none text-[15px] font-extrabold ${lang === l ? "bg-texto text-white" : "bg-transparent text-texto"}`}
              >
                {l === "pt" ? "Português" : "English"}
              </button>
            ))}
          </div>
          <button type="button" className={itemMenu} onClick={() => setFolha("municipio")}>
            {t("Trocar município", "Change municipality")} <span className="text-lavoura">›</span>
          </button>
          <button type="button" className={itemMenu} onClick={() => irPara("calendario")}>
            {t("Calendário da safra", "Season calendar")} <span className="text-lavoura">›</span>
          </button>
          <button type="button" className={itemMenu} onClick={() => irPara("rotacoes")}>
            {t("O que plantar depois", "What to plant next")} <span className="text-lavoura">›</span>
          </button>
          <button
            type="button"
            className={itemMenu}
            onClick={() => {
              setFolha(null);
              setTela("inicio");
              setModo("vou");
              setTimeout(() => {
                const el = document.getElementById("detalhes") as HTMLDetailsElement | null;
                if (el) {
                  el.open = true;
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 60);
            }}
          >
            {t("Detalhes técnicos e fontes", "Technical details and sources")} <span className="text-lavoura">›</span>
          </button>
          <p className="m-0 px-1 pt-1 font-mono text-[11px] tracking-[0.14em] text-texto-2">HOUSTON, WE HAVE A HARVEST · NASA SPACE APPS 2026</p>
        </Folha>
      )}

      {folha === "municipio" && (
        <Folha titulo={t("Onde fica sua lavoura?", "Where is your field?")} onFechar={fecharFolha}>
          <div role="radiogroup" aria-label={t("Município", "Municipality")} className="flex flex-wrap gap-2">
            {locais.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={l.id === local.id}
                onClick={() => escolherLocal(l.id)}
                className={`min-h-12 cursor-pointer rounded-full border-none px-4 text-[15px] font-extrabold ${l.id === local.id ? "bg-lavoura text-white" : "bg-white text-texto"}`}
              >
                {l.nome}
              </button>
            ))}
          </div>
          <EscolherLugar
            params={p}
            indiceEnso={data.indiceEnso}
            onLocal={(l) => {
              setExtras((xs) => (xs.some((x) => x.id === l.id) ? xs : [...xs, l]));
              escolherLocal(l.id);
            }}
          />
        </Folha>
      )}

      {folha === "data" && (
        <Folha titulo={t("Quando você plantou a soja?", "When did you plant soybeans?")} onFechar={fecharFolha}>
          <div role="radiogroup" aria-label={t("Data de plantio da soja", "Soybean planting date")} className="grid grid-cols-4 gap-1.5">
            {local.datas.map((x, i) => {
              const dm = diaEMes(x.dataSoja, lang);
              return (
                <button
                  key={x.dataSoja}
                  type="button"
                  role="radio"
                  aria-checked={i === idx}
                  aria-label={fmtDia(x.dataSoja, lang)}
                  onClick={() => {
                    setIdx(i);
                    setFolha(null);
                  }}
                  className={`flex min-h-[58px] cursor-pointer flex-col items-center justify-center rounded-2xl border-none text-[17px] font-extrabold leading-[1.05] ${
                    i === idx ? "bg-lavoura text-white" : "bg-white text-texto"
                  }`}
                >
                  {dm.dia}
                  <span className={`text-xs font-semibold ${i === idx ? "text-[#C9F7A8]" : "text-texto-2"}`}>{dm.mes}</span>
                </button>
              );
            })}
          </div>
        </Folha>
      )}
    </LangContext.Provider>
  );
}
