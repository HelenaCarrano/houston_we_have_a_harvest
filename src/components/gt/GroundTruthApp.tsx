"use client";

import { useMemo, useState } from "react";
import type { DataView, LocalView, RiscoView, ViewData } from "@/lib/view-data";

// ---------- utilitários de formatação ----------

const ddmm = (mmdd: string) => `${mmdd.slice(3, 5)}/${mmdd.slice(0, 2)}`;
const isoBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const num = (x: number, casas = 1) =>
  x.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** "X de cada 10 anos" honesto para frequências pequenas. */
function deCada10Texto(r: RiscoView): string {
  if (r.anosComEvento === 0) return "0 de cada 10 anos";
  const x = Math.round(r.frequencia * 10);
  if (x === 0) return "menos de 1 de cada 10 anos";
  return `${x} de cada 10 anos`;
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

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-wider text-gt-muted">{children}</p>;
}

function Fonte({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] leading-relaxed text-gt-muted">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-gt-line bg-gt-card p-4 sm:p-6 ${className}`}>{children}</section>
  );
}

function LinhaDoTempo({ d, local }: { d: DataView; local: LocalView }) {
  const ep = local.epocaGeada;
  return (
    <div>
      <div className="relative h-24 select-none" aria-hidden="true">
        {/* época típica de geada */}
        {ep && (
          <div
            className="absolute top-0 bottom-6 rounded-md bg-gt-frost/15 border border-dashed border-gt-frost/60"
            style={{ left: pct(ep.inicio), width: larg(ep.inicio, ep.fim) }}
          />
        )}
        {/* soja */}
        <div
          className="absolute top-3 h-6 rounded-md bg-gt-green/85 motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.dataSoja), width: larg(d.dataSoja, d.colheitaSoja) }}
        >
          <span className="px-2 text-xs font-semibold leading-6 text-gt-bg">Soja</span>
        </div>
        {/* milho */}
        <div
          className="absolute top-11 h-6 rounded-md bg-[#E8D27A] motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.plantioMilho), width: larg(d.plantioMilho, d.janelaFim) }}
        >
          <span className="px-2 text-xs font-semibold leading-6 text-gt-bg whitespace-nowrap">Milho</span>
        </div>
        {/* janela de floração */}
        <div
          className="absolute top-10 h-8 rounded-md border-2 border-gt-orange motion-safe:transition-all motion-safe:duration-500"
          style={{ left: pct(d.janelaInicio), width: larg(d.janelaInicio, d.janelaFim) }}
        />
        {/* eixo */}
        <div className="absolute bottom-0 left-0 right-0 flex border-t border-gt-line">
          {MESES.map((m) => (
            <span key={m} className="flex-1 pt-1 text-center font-mono text-[10px] text-gt-muted">
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
          <span className="text-gt-orange">Floração </span>
          <b>{ddmm(d.floracao)}</b>
          <span className="text-gt-muted"> ±10 d</span>
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
  cor,
  r,
  explicacao,
  extra,
}: {
  titulo: string;
  cor: "frost" | "orange";
  r: RiscoView;
  explicacao: string;
  extra?: React.ReactNode;
}) {
  const corTexto = cor === "frost" ? "text-gt-frost" : "text-gt-orange";
  const corBarra = cor === "frost" ? "bg-gt-frost" : "bg-gt-orange";
  return (
    <Card className="flex flex-col gap-3">
      <Rotulo>{titulo}</Rotulo>
      <p className={`font-heading text-4xl font-extrabold leading-tight sm:text-5xl ${corTexto}`}>
        {deCada10Texto(r)}
      </p>
      <p className="text-base">
        Aconteceu em <b>{r.anosComEvento}</b> de <b>{r.totalAnos}</b> safras
        {r.periodo ? ` (${r.periodo[0]}–${r.periodo[1]})` : ""}.
      </p>
      {/* barra de anos */}
      <div className="flex gap-[2px]" role="img" aria-label={`Anos com evento: ${r.anos.join(", ") || "nenhum"}`}>
        {r.periodo &&
          Array.from({ length: r.periodo[1] - r.periodo[0] + 1 }, (_, i) => r.periodo![0] + i).map((ano) => (
            <span
              key={ano}
              title={String(ano)}
              className={`h-5 flex-1 rounded-[2px] ${r.anos.includes(ano) ? corBarra : "bg-gt-line"}`}
            />
          ))}
      </div>
      <p className="text-sm text-gt-muted">
        {r.anos.length ? `Anos: ${r.anos.join(", ")}` : "Nenhum ano com o evento neste período."}
      </p>
      <p className="text-sm text-gt-muted">{explicacao}</p>
      {extra}
      <p className="mt-auto font-mono text-xs text-gt-muted">
        Confiança <b className="text-gt-text">{r.confianca}</b> · {r.totalAnos} anos de dados diários NASA POWER
      </p>
    </Card>
  );
}

function GraficoDatas({
  local,
  idx,
  onSelect,
}: {
  local: LocalView;
  idx: number;
  onSelect: (i: number) => void;
}) {
  const max = Math.max(...local.datas.map((d) => Math.max(d.geada.frequencia, d.seca.frequencia)), 0.1);
  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-3" style={{ height: 120 }}>
        {local.datas.map((d, i) => (
          <button
            key={d.dataSoja}
            onClick={() => onSelect(i)}
            aria-label={`Soja em ${ddmm(d.dataSoja)}: geada ${d.geada.anosComEvento} de ${d.geada.totalAnos}, seca ${d.seca.anosComEvento} de ${d.seca.totalAnos}`}
            aria-pressed={i === idx}
            className={`flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 rounded-md px-0.5 pb-0.5 ${
              i === idx ? "bg-gt-card2 outline outline-1 outline-gt-green" : "hover:bg-gt-card2"
            }`}
          >
            <span
              className="w-1/2 max-w-4 rounded-t-sm bg-gt-frost motion-safe:transition-all"
              style={{ height: `${(d.geada.frequencia / max) * 100}%`, minHeight: 2 }}
            />
            <span
              className="w-1/2 max-w-4 rounded-t-sm bg-gt-orange motion-safe:transition-all"
              style={{ height: `${(d.seca.frequencia / max) * 100}%`, minHeight: 2 }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5 sm:gap-3">
        {local.datas.map((d) => (
          <span key={d.dataSoja} className="min-w-0 flex-1 text-center font-mono text-[10px] text-gt-muted">
            {ddmm(d.dataSoja)}
          </span>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 font-mono text-[11px] text-gt-muted">
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-gt-frost" /> geada na floração
        </span>
        <span>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-gt-orange" /> seca no início do milho
        </span>
      </p>
    </div>
  );
}

function Recomendacao({ local, idx }: { local: LocalView; idx: number }) {
  const sel = local.datas[idx];
  const minG = Math.min(...local.datas.map((d) => d.geada.anosComEvento));
  // última data com o menor risco de geada
  let ate = 0;
  local.datas.forEach((d, i) => {
    if (d.geada.anosComEvento === minG) ate = i;
  });
  const alvo = local.datas[ate];
  return (
    <p className="text-lg leading-snug sm:text-xl">
      Plantando a soja até <b className="text-gt-green">{ddmm(alvo.dataSoja)}</b>, o risco de geada na floração cai para{" "}
      <b className="text-gt-green">{deCada10Texto(alvo.geada)}</b> ({alvo.geada.anosComEvento} de {alvo.geada.totalAnos}{" "}
      safras).
      {idx > ate && (
        <>
          {" "}
          Na data escolhida ({ddmm(sel.dataSoja)}) foram {sel.geada.anosComEvento} de {sel.geada.totalAnos}.
        </>
      )}
      <span className="block pt-1 text-sm text-gt-muted">
        Considere também a seca no início do milho e a janela do ZARC para o seu município. Decisão final com o técnico.
      </span>
    </p>
  );
}

function Prova2026({ local, limite }: { local: LocalView; limite: number }) {
  const p = local.prova2026;
  return (
    <Card>
      <Rotulo>Prova 2026 · {local.nome}</Rotulo>
      <h2 className="mt-1 text-2xl font-bold">O que o satélite viu na safrinha 2026</h2>
      {!p.disponivel ? (
        <p className="mt-3">Os dados diários de 2026 ainda não estão disponíveis no NASA POWER para este local.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gt-line bg-gt-card2 p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-gt-frost">NASA POWER (dados diários)</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <b>Umidade do solo na raiz (GWETROOT), abril/2026:</b> {num(p.soloAbril2026 ?? 0, 2)} (média 1991–2025:{" "}
                {num(p.soloAbrilMedia, 2)}). Foi o <b>{p.soloAbrilRank}º abril mais seco</b> em {p.soloAbrilAnos} anos.
              </li>
              <li>
                <b>Chuva em abril/2026:</b> {p.chuvaAbril2026} mm (média 1991–2025: {p.chuvaAbrilMedia} mm).
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
            <Fonte>Dados até {isoBr(p.ultimaData)}. Grade de ~50 km; temperatura do ar a 2 m, não na superfície.</Fonte>
          </div>
          <div className="rounded-xl border border-gt-line bg-gt-card2 p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-gt-orange">Deral / Seab-PR (relatos de campo)</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <b>Abril/2026:</b> estiagem e calor afetaram o feijão e o milho da safra 2025/26 no Paraná.{" "}
                <a
                  className="text-gt-frost underline underline-offset-2"
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
                  className="text-gt-frost underline underline-offset-2"
                  href="https://revistacultivar.com.br/noticias/pr-safra-2025-26-milho-e-feijao-sofrem-impacto-das-geadas"
                  target="_blank"
                  rel="noreferrer"
                >
                  Revista Cultivar, 19/5/2026
                </a>
              </li>
            </ul>
            <Fonte>Relatos estaduais/regionais; não são medições no ponto exato do mapa.</Fonte>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------- app ----------

export function GroundTruthApp({ data }: { data: ViewData }) {
  const [localId, setLocalId] = useState(data.locais[0].id);
  const local = useMemo(() => data.locais.find((l) => l.id === localId) ?? data.locais[0], [data, localId]);
  const idxPadrao = Math.max(
    local.datas.findIndex((d) => d.dataSoja === "10-20"),
    0,
  );
  const [idx, setIdx] = useState(idxPadrao);
  const [baixada, setBaixada] = useState(false);
  const d = local.datas[idx];
  const p = data.params;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-gt-green">
          GroundTruth · NASA Space Apps 2026 · Field Shift
        </p>
        <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
          Se eu plantar a soja nesta data, o milho safrinha pega geada ou seca?
        </h1>
        <p className="max-w-3xl text-base text-gt-muted sm:text-lg">
          A data da soja define quando o milho safrinha floresce. Calculamos, com {local.datas[0].geada.totalAnos} anos
          de dados diários de satélite e modelo da NASA, quantas vezes a floração teria pegado frio ou o início do milho
          teria pegado seca.
        </p>
      </header>

      {/* 1. Escolhas */}
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
                className={`min-h-11 rounded-xl border px-4 py-2 text-left ${
                  l.id === localId
                    ? "border-gt-green bg-gt-green/10 text-gt-text"
                    : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-muted"
                }`}
              >
                <span className="block font-semibold">{l.nome}</span>
                <span className="block font-mono text-[11px] text-gt-muted">
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
                className={`min-h-11 min-w-16 rounded-xl border px-3 font-mono text-sm ${
                  i === idx
                    ? "border-gt-green bg-gt-green font-semibold text-gt-bg"
                    : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-muted"
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
          <span>Minha lavoura fica em baixada</span>
        </label>
      </Card>

      {/* 2. Linha do tempo */}
      <Card>
        <Rotulo>Linha do tempo soja → milho safrinha</Rotulo>
        <div className="mt-3">
          <LinhaDoTempo d={d} local={local} />
        </div>
        <Fonte>
          Ciclos de exemplo, a validar com agronomia/ZARC: soja {p.cicloSoja} dias, intervalo {p.intervalo} dias, milho
          até florescer {p.diasAteFlorescer} dias. Época de geada: mediana do primeiro e do último dia com mínima ≤{" "}
          {p.limiteGeadaC} °C, 1991–2025.
        </Fonte>
      </Card>

      {/* 3. Cards de risco */}
      <div className="grid gap-5 md:grid-cols-2">
        <CardRisco
          titulo="Geada na floração do milho"
          cor="frost"
          r={d.geada}
          explicacao={`Ano com evento = mínima do ar a 2 m ≤ ${p.limiteGeadaC} °C em algum dia entre ${ddmm(d.janelaInicio)} e ${ddmm(d.janelaFim)}.`}
          extra={
            baixada ? (
              <p className="rounded-lg border border-gt-frost/50 bg-gt-frost/10 p-3 text-sm">
                ⚠️ Baixadas acumulam ar frio; o risco local tende a ser maior que o calculado para a região.
              </p>
            ) : null
          }
        />
        <CardRisco
          titulo="Seca no início do milho"
          cor="orange"
          r={d.seca}
          explicacao={`Ano com evento = ${p.sequenciaSecaDias}+ dias seguidos com chuva < ${p.chuvaDiaSecoMm} mm, ou umidade do solo na raiz entre as ${p.percentilUmidadeSolo}% mais baixas, nos ${p.diasSecaInicio} dias após o plantio do milho (${ddmm(d.plantioMilho)}).`}
        />
      </div>

      {/* 4. Recomendação + comparação de datas */}
      <Card className="flex flex-col gap-5">
        <Rotulo>Recomendação para {local.nome}</Rotulo>
        <Recomendacao local={local} idx={idx} />
        <GraficoDatas local={local} idx={idx} onSelect={setIdx} />
      </Card>

      {/* 5. Prova 2026 */}
      <Prova2026 local={local} limite={p.limiteGeadaC} />

      <footer className="flex flex-col gap-2 border-t border-gt-line pt-5">
        <Rotulo>Fontes e limitações</Rotulo>
        <Fonte>
          Dados: NASA POWER Daily API, community AG (T2M_MIN, PRECTOTCORR, GWETROOT), {isoBr(local.periodoDados.inicio)} a{" "}
          {isoBr(local.periodoDados.fim)}, baixados em {isoBr(local.downloadedAt.slice(0, 10))}.{" "}
          <a
            className="underline underline-offset-2"
            href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/"
            target="_blank"
            rel="noreferrer"
          >
            Documentação da API
          </a>
          .
        </Fonte>
        <Fonte>
          Limitações: o NASA POWER é uma grade de ~50 km (elevação média da célula: {local.elevacaoGradeM ?? "?"} m);
          a temperatura é do ar a 2 m, não da superfície; os ciclos das culturas são valores de exemplo; isto não é
          previsão do tempo. Ferramenta de apoio: a decisão é do agricultor com o técnico.
        </Fonte>
      </footer>
    </div>
  );
}
