"use client";

import { useMemo, useState } from "react";
import type { DataView, LocalView, RiscoView, ViewData } from "@/lib/view-data";
import { Rotacoes, SeloNivel } from "@/components/gt/Rotacoes";

// ---------- utilitários de formatação ----------

const ddmm = (mmdd: string) => `${mmdd.slice(3, 5)}/${mmdd.slice(0, 2)}`;
const isoBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const num = (x: number, casas = 1) =>
  x.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** "X/10" e frase honesta para frequências pequenas. */
function deCada10(r: RiscoView): { grande: string; frase: string } {
  const x = Math.round(r.frequencia * 10);
  if (r.anosComEvento === 0) return { grande: "0/10", frase: "nenhum ano em 10" };
  if (x === 0) return { grande: "<1/10", frase: "menos de 1 de cada 10 anos" };
  return { grande: `${x}/10`, frase: `${x} de cada 10 anos` };
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
const MESES = ["set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago"];

// ---------- componentes ----------

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
  const ep = local.epocaGeada;
  return (
    <div>
      <div className="relative h-28 select-none" aria-hidden="true">
        {ep && (
          <div
            className="absolute top-0 bottom-6 rounded-lg border border-dashed border-gt-frost-line bg-gt-frost-bg/70"
            style={{ left: pct(ep.inicio), width: larg(ep.inicio, ep.fim) }}
          >
            <span className="absolute right-1 top-1 font-mono text-[10px] text-gt-frost">❄ geada</span>
          </div>
        )}
        <div
          className="absolute top-4 h-7 rounded-lg bg-gt-soy motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.dataSoja), width: larg(d.dataSoja, d.colheitaSoja) }}
        >
          <span className="px-2 text-xs font-extrabold leading-7 text-gt-text">Soja</span>
        </div>
        <div
          className="absolute top-13 h-7 rounded-lg bg-gt-gold motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.plantioMilho), width: larg(d.plantioMilho, d.faseFim) }}
        >
          <span className="whitespace-nowrap px-2 text-xs font-extrabold leading-7 text-gt-bg">Milho</span>
        </div>
        <div
          className="gt-pulse absolute top-12 h-9 rounded-lg border-2 border-gt-orange motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.faseInicio), width: larg(d.faseInicio, d.faseFim) }}
        />
        <div className="absolute bottom-0 left-0 right-0 flex border-t border-gt-line">
          {MESES.map((m) => (
            <span key={m} className="flex-1 pt-1 text-center font-mono text-[10px] text-gt-faint">
              {m}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <li>
          <span className="text-gt-muted">Plantio soja </span>
          <b>{ddmm(d.dataSoja)}</b>
        </li>
        <li>
          <span className="text-gt-muted">Plantio milho </span>
          <b>{ddmm(d.plantioMilho)}</b>
        </li>
        <li>
          <span className="text-gt-orange">Fase crítica </span>
          <b>
            {ddmm(d.faseInicio)}–{ddmm(d.faseFim)}
          </b>
        </li>
        {ep && (
          <li>
            <span className="text-gt-frost">Época de geada </span>
            <b>
              {ddmm(ep.inicio)}–{ddmm(ep.fim)}
            </b>
          </li>
        )}
      </ul>
    </div>
  );
}

function CardRisco({
  titulo,
  tipo,
  r,
  regra,
  extra,
}: {
  titulo: string;
  tipo: "geada" | "seca";
  r: RiscoView;
  regra: string;
  extra?: React.ReactNode;
}) {
  const cor = tipo === "geada" ? "text-gt-frost" : "text-gt-orange";
  const barra = tipo === "geada" ? "bg-gt-frost" : "bg-gt-orange";
  const t = deCada10(r);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-extrabold">{titulo}</h2>
        <SeloNivel nivel={r.nivel} rotulo="Risco" />
      </div>
      <p className={`text-[40px] font-black leading-none ${cor}`}>
        {t.grande} <span className="text-base font-semibold text-gt-muted">anos</span>
      </p>
      <p className="text-base">
        <b>{t.frase}</b>: aconteceu em {r.anosComEvento} de {r.totalAnos} safras
        {r.periodo ? ` (${r.periodo[0]}–${r.periodo[1]})` : ""}.
      </p>
      <div className="flex gap-[2px]" role="img" aria-label={`Anos com evento: ${r.anos.join(", ") || "nenhum"}`}>
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
        {r.anos.length ? `Anos: ${r.anos.join(", ")}` : "Nenhum ano com o evento neste período."}
        {r.anosFortes && r.anosFortes.length > 0 && (
          <>
            {" "}
            · <b className="text-gt-frost">Geada forte</b> (≤ 1 °C): {r.anosFortes.join(", ")}
          </>
        )}
      </p>
      {r.detalheSeca && (
        <ul className="grid gap-1 rounded-xl border border-gt-line bg-gt-card2 p-3 text-sm">
          <li>
            Solo muito seco: <b>{r.detalheSeca.anosSoloSeco.length}</b> de {r.totalAnos} anos
          </li>
          <li>
            Veranico de 15+ dias: <b>{r.detalheSeca.anosVeranico.length}</b> de {r.totalAnos} anos
          </li>
          <li>
            Os dois juntos (mais graves): <b>{r.detalheSeca.anosAmbos.length}</b>
            {r.detalheSeca.anosAmbos.length ? ` (${r.detalheSeca.anosAmbos.join(", ")})` : ""}
          </li>
        </ul>
      )}
      <p className="text-sm text-gt-muted">{regra}</p>
      {extra}
      <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
        NASA POWER {r.periodo ? `${r.periodo[0]}–${r.periodo[1]}` : ""} · confiança {r.confianca}
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
  const g = (d: DataView) => (baixada ? d.geadaBaixada : d.geada);
  const max = Math.max(...datas.map((d) => Math.max(g(d).frequencia, d.seca.frequencia)), 0.1);
  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 120 }}>
        {datas.map((d, i) => (
          <button
            key={d.dataSoja}
            onClick={() => onSelect(i)}
            aria-label={`Soja em ${ddmm(d.dataSoja)}: geada ${g(d).anosComEvento} de ${g(d).totalAnos}, seca ${d.seca.anosComEvento} de ${d.seca.totalAnos}`}
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
            {ddmm(d.dataSoja)}
          </span>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 font-mono text-[11px] text-gt-faint">
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-gt-frost" /> geada na fase crítica
        </span>
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-gt-orange" /> seca na fase crítica
        </span>
      </p>
    </div>
  );
}

function Recomendacao({ datas, idx, baixada }: { datas: DataView[]; idx: number; baixada: boolean }) {
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
        Plantando a soja até <b className="font-black">{ddmm(alvo.dataSoja)}</b>, o risco de geada na fase crítica cai
        para <b className="font-black">{deCada10(g(alvo)).frase}</b> ({g(alvo).anosComEvento} de {g(alvo).totalAnos}{" "}
        safras).
        {!ok && (
          <>
            {" "}
            Na data escolhida ({ddmm(sel.dataSoja)}) foram {g(sel).anosComEvento} de {g(sel).totalAnos}.
          </>
        )}
      </p>
      <p className="pt-2 text-sm">
        Confira também a seca e a janela do ZARC do seu município (necessária para crédito e seguro). A decisão final é
        com o técnico.
      </p>
    </div>
  );
}

function Prova2026({ local, d, limite }: { local: LocalView; d: DataView; limite: number }) {
  const p = local.prova2026;
  const app2026 = {
    geada: d.geada.anos.includes(2026),
    geadaBaixada: d.geadaBaixada.anos.includes(2026),
    seca: d.seca.anos.includes(2026),
  };
  const simNao = (b: boolean) => (b ? "sim" : "não");
  return (
    <Card>
      <Rotulo>Prova 2026 · {local.nome}</Rotulo>
      <h2 className="mt-1 text-2xl font-black">O que o satélite viu na safrinha 2026</h2>
      {!p.disponivel ? (
        <p className="mt-3">Os dados diários de 2026 ainda não estão disponíveis no NASA POWER para este local.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[18px] border border-gt-frost-line bg-gt-frost-bg p-4 text-gt-frost-text">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-frost">NASA POWER · dados diários</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <b>Umidade do solo na raiz (GWETROOT), abril/2026:</b> {num(p.soloAbril2026 ?? 0, 2)} (média 1981–2025:{" "}
                {num(p.soloAbrilMedia, 2)}). <b>{p.soloAbrilRank}º abril mais seco</b> em {p.soloAbrilAnos} anos.
              </li>
              <li>
                <b>Chuva em abril/2026:</b> {p.chuvaAbril2026} mm (média 1981–2025: {p.chuvaAbrilMedia} mm).
                {p.chuvaAbril2026 !== null && p.chuvaAbril2026 > p.chuvaAbrilMedia && (
                  <> A chuva total ficou acima da média; o solo, mesmo assim, ficou seco.</>
                )}
              </li>
              {p.minMaio2026 !== null && p.minMaio2026Data && (
                <li>
                  <b>Menor temperatura do ar (2 m) em maio/2026:</b> {num(p.minMaio2026)} °C em {isoBr(p.minMaio2026Data)}.
                </li>
              )}
              {p.minJunho2026 !== null && p.minJunho2026Data && (
                <li>
                  <b>Em junho/2026:</b> {num(p.minJunho2026)} °C em {isoBr(p.minJunho2026Data)}.
                </li>
              )}
              {p.diasFrioMaioJunho2026 !== null && (
                <li>
                  <b>Dias com mínima ≤ {limite} °C em maio e junho/2026:</b> {p.diasFrioMaioJunho2026}.
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-[18px] border border-gt-risk-line bg-gt-risk-bg p-4 text-gt-risk-text">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-orange">Deral · relatos de campo</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <b>Abril/2026:</b> estiagem e calor afetaram o feijão e o milho da safra 2025/26 no Paraná.{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://revistacultivar.com.br/noticias/pr-safra-2025-26-estiagem-e-calor-afetam-feijao-e-milho"
                  target="_blank"
                  rel="noreferrer"
                >
                  Revista Cultivar, 9/4/2026
                </a>
              </li>
              <li>
                <b>Maio/2026:</b> geadas queimaram folhas do milho safrinha em baixadas; o feijão de 2ª safra teve perdas
                significativas; o trigo não teve dano significativo.{" "}
                <a
                  className="underline underline-offset-2"
                  href="https://revistacultivar.com.br/noticias/pr-safra-2025-26-milho-e-feijao-sofrem-impacto-das-geadas"
                  target="_blank"
                  rel="noreferrer"
                >
                  Revista Cultivar, 19/5/2026
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-[18px] border border-gt-line bg-gt-card2 p-4 md:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-green">
              O que o app marca para 2026 · soja em {ddmm(d.dataSoja)}
            </p>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
              <li>
                Geada na fase crítica (≤ {limite} °C): <b>{simNao(app2026.geada)}</b>
              </li>
              <li>
                Geada em baixada (≤ {limite + 1} °C): <b>{simNao(app2026.geadaBaixada)}</b>
              </li>
              <li>
                Seca na fase crítica: <b>{simNao(app2026.seca)}</b>
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className="mt-3">
        <Fonte>
          Dados POWER até {isoBr(p.ultimaData)}. Grade de ~50 km; temperatura do ar a 2 m, não na superfície. Relatos do
          Deral são regionais, não medições no ponto do mapa. O resultado é mostrado como sai, bom ou ruim.
        </Fonte>
      </div>
    </Card>
  );
}

// ---------- app ----------

export function GroundTruthApp({ data }: { data: ViewData }) {
  const [localId, setLocalId] = useState(data.locais[0].id);
  const local = useMemo(() => data.locais.find((l) => l.id === localId) ?? data.locais[0], [data, localId]);
  const [idx, setIdx] = useState(Math.max(local.datas.findIndex((d) => d.dataSoja === "10-20"), 0));
  const [baixada, setBaixada] = useState(false);
  const d = local.datas[idx];
  const p = data.params;
  const geada = baixada ? d.geadaBaixada : d.geada;
  const limiteAtual = p.limiteGeadaC + (baixada ? p.ajusteBaixadaC : 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-green">
          <span className="gt-pulse">●</span> GroundTruth · NASA Space Apps 2026 · Field Shift
        </p>
        <h1 className="text-[30px] font-black leading-tight sm:text-5xl">
          Se eu plantar a soja nesta data, o milho safrinha pega geada ou seca?
        </h1>
        <p className="max-w-3xl text-base text-gt-muted sm:text-lg">
          A data da soja define quando o milho safrinha chega à fase crítica (pendoamento e enchimento de grãos).
          Contamos, em {d.geada.totalAnos} anos de dados diários da NASA desde 1981, quantas vezes essa fase pegou geada
          ou seca.
        </p>
      </header>

      <Card className="flex flex-col gap-5">
        <div>
          <Rotulo>1 · Município</Rotulo>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Município">
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
          <Rotulo>2 · Data de plantio da soja</Rotulo>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Data de plantio da soja">
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
                {ddmm(x.dataSoja)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={baixada}
            onChange={(e) => setBaixada(e.target.checked)}
            className="size-5 accent-[#9BE36B]"
          />
          <span>
            Minha lavoura fica em <b>baixada</b>{" "}
            <span className="text-sm text-gt-faint">(limite de geada sobe de {p.limiteGeadaC} para {p.limiteGeadaC + p.ajusteBaixadaC} °C)</span>
          </span>
        </label>
      </Card>

      <Card>
        <Rotulo>Linha do tempo soja → milho safrinha</Rotulo>
        <div className="mt-3">
          <LinhaDoTempo d={d} local={local} />
        </div>
        <Fonte>
          Hipóteses a validar com agronomia/ZARC: soja {p.cicloSoja} dias, intervalo {p.intervalo} dias, fase crítica do
          milho de {p.faseCriticaInicio} a {p.faseCriticaFim} dias após o plantio. Época de geada: mediana do primeiro e
          do último dia com mínima ≤ {p.limiteGeadaC} °C, 1981–2025.
        </Fonte>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <CardRisco
          titulo={baixada ? "Geada na fase crítica · baixada" : "Geada na fase crítica"}
          tipo="geada"
          r={geada}
          regra={`Ano com geada = mínima do ar a 2 m ≤ ${limiteAtual} °C em algum dia entre ${ddmm(d.faseInicio)} e ${ddmm(d.faseFim)}. ${p.limiteGeadaC} °C no abrigo ≈ geada na relva (Embrapa).`}
          extra={
            baixada ? (
              <p className="rounded-xl border border-gt-frost-line bg-gt-frost-bg p-3 text-sm text-gt-frost-text">
                ❄ Baixadas acumulam ar frio em noites calmas. Usamos +{p.ajusteBaixadaC} °C no limite (hipótese a
                calibrar); o risco local pode ser ainda maior. Sem baixada: {d.geada.anosComEvento} de {d.geada.totalAnos}.
              </p>
            ) : null
          }
        />
        <CardRisco
          titulo="Seca na fase crítica"
          tipo="seca"
          r={d.seca}
          regra={`Ano seco = ${p.sequenciaSecaDias}+ dias seguidos com chuva < ${p.chuvaDiaSecoMm} mm OU umidade do solo na raiz entre as ${p.percentilUmidadeSolo}% mais baixas para as mesmas datas, entre ${ddmm(d.faseInicio)} e ${ddmm(d.faseFim)}. Como o solo é comparado com a própria história, cerca de 1 em cada 5 anos sempre aparece como solo seco.`}
        />
      </div>

      <Card className="flex flex-col gap-5">
        <Rotulo>Recomendação para {local.nome}</Rotulo>
        <Recomendacao datas={local.datas} idx={idx} baixada={baixada} />
        <GraficoDatas datas={local.datas} idx={idx} onSelect={setIdx} baixada={baixada} />
      </Card>

      <Rotacoes d={d} nomeLocal={local.nome} baixada={baixada} />

      <Prova2026 local={local} d={d} limite={p.limiteGeadaC} />

      <footer className="flex flex-col gap-2 border-t border-gt-line pt-5">
        <Rotulo>Fontes e limitações</Rotulo>
        <Fonte>
          Dados: NASA POWER Daily API, community AG (T2M_MIN, PRECTOTCORR, GWETROOT), {isoBr(local.periodoDados.inicio)}{" "}
          a {isoBr(local.periodoDados.fim)}, baixados em {isoBr(local.downloadedAt.slice(0, 10))}.{" "}
          <a className="underline underline-offset-2" href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/" target="_blank" rel="noreferrer">
            API
          </a>
          . Limiar de 3 °C: diferença abrigo–relva de 3–6 °C (
          <a className="underline underline-offset-2" href="https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1084446/1/ID442832017CBAGRO20MM398.pdf" target="_blank" rel="noreferrer">
            Embrapa Trigo
          </a>
          ,{" "}
          <a className="underline underline-offset-2" href="https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1139138/1/BolAgroClimatico-dez21.pdf" target="_blank" rel="noreferrer">
            Embrapa
          </a>
          ,{" "}
          <a className="underline underline-offset-2" href="https://ojs.uel.br/revistas/uel/index.php/semagrarias/article/download/30322/24555/166627" target="_blank" rel="noreferrer">
            Semina/UEL
          </a>
          ).
        </Fonte>
        <Fonte>
          Limitações: o NASA POWER é uma grade de ~50 km (elevação média da célula: {local.elevacaoGradeM ?? "?"} m); a
          temperatura é do ar a 2 m, não da planta; fases das culturas e limiares são hipóteses a calibrar; o ajuste de
          baixada não usa relevo real (SRTM) ainda; isto não é previsão do tempo. Ferramenta de apoio: a decisão é do
          agricultor com o técnico.
        </Fonte>
      </footer>
    </div>
  );
}
