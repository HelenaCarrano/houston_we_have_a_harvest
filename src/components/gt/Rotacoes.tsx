"use client";

import { useState } from "react";
import type { DataView } from "@/lib/view-data";
import { ROTACOES, PRIORIDADES, NOTA_NITROGENIO, REGRA_ORDEM, type Prioridade } from "@/lib/rotacoes";

const ddmm = (mmdd: string) => `${mmdd.slice(3, 5)}/${mmdd.slice(0, 2)}`;
type Nivel = "Baixo" | "Médio" | "Alto";
const PESO_NIVEL: Record<Nivel, number> = { Baixo: 0, Médio: 1, Alto: 2 };

function nivelPorFreq(f: number): Nivel {
  const x = Math.round(f * 10);
  return x <= 1 ? "Baixo" : x <= 3 ? "Médio" : "Alto";
}

export function SeloNivel({ nivel, rotulo }: { nivel: Nivel | "Não calculado"; rotulo?: string }) {
  const cls =
    nivel === "Baixo"
      ? "bg-gt-safe-bg border-gt-safe-line text-gt-safe-text"
      : nivel === "Médio"
        ? "bg-gt-risk-bg border-gt-risk-line text-gt-risk-text"
        : nivel === "Alto"
          ? "bg-gt-risk-bg border-gt-orange text-gt-orange"
          : "bg-gt-card2 border-gt-line text-gt-muted";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${cls}`}>
      {rotulo ? `${rotulo}: ` : ""}
      {nivel}
    </span>
  );
}

function Pontos({ n }: { n: number }) {
  return (
    <span aria-label={`${n} de 3`} className="inline-flex gap-0.5 align-middle">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`inline-block size-2.5 rounded-full ${i <= n ? "bg-gt-green" : "bg-gt-line"}`} />
      ))}
    </span>
  );
}

function Lista({ titulo, itens, cor }: { titulo: string; itens: string[]; cor: string }) {
  return (
    <div>
      <p className={`font-mono text-[11px] uppercase tracking-[0.1em] ${cor}`}>{titulo}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-gt-muted">
        {itens.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export function Rotacoes({ d, nomeLocal, baixada }: { d: DataView; nomeLocal: string; baixada: boolean }) {
  const [prios, setPrios] = useState<Prioridade[]>(["agua", "erosao"]);
  const toggle = (p: Prioridade) => setPrios((xs) => (xs.includes(p) ? xs.filter((x) => x !== p) : [...xs, p]));

  const geada = baixada ? d.geadaBaixada : d.geada;
  const nivelGeada = nivelPorFreq(geada.frequencia);
  const nivelSeca = nivelPorFreq(d.seca.frequencia);
  const nivelClimaMilho: Nivel = PESO_NIVEL[nivelGeada] >= PESO_NIVEL[nivelSeca] ? nivelGeada : nivelSeca;

  const avaliadas = ROTACOES.map((r) => {
    const soma = prios.reduce((s, p) => s + r.atende[p], 0);
    const risco = r.riscoCalculado ? PESO_NIVEL[nivelClimaMilho] : 1; // trigo: não calculado → neutro no desempate
    return { r, soma, risco };
  }).sort((a, b) => b.soma - a.soma || a.risco - b.risco);
  const melhor = avaliadas[0];

  return (
    <section className="rounded-[22px] border border-gt-line bg-gt-card p-4 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
        Comparar rotações · {nomeLocal} · soja em {ddmm(d.dataSoja)}
        {baixada ? " · baixada" : ""}
      </p>
      <h2 className="mt-1 text-2xl font-black">O que plantar depois da soja?</h2>

      <div className="mt-4">
        <p className="text-sm text-gt-muted">O que importa para você nesta safra? (marque uma ou mais)</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Prioridades do agricultor">
          {PRIORIDADES.map((p) => {
            const on = prios.includes(p.id);
            return (
              <button
                key={p.id}
                aria-pressed={on}
                onClick={() => toggle(p.id)}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                  on ? "border-gt-green bg-gt-green text-gt-bg" : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-btn-line"
                }`}
              >
                {on ? "✓ " : ""}
                {p.label}
              </button>
            );
          })}
        </div>
        {prios.includes("nitrogenio") && (
          <p className="mt-2 rounded-xl border border-gt-frost-line bg-gt-frost-bg p-3 text-sm text-gt-frost-text">{NOTA_NITROGENIO}</p>
        )}
      </div>

      <ol className="mt-5 grid gap-4 lg:grid-cols-3">
        {avaliadas.map(({ r, soma }, i) => {
          const destaque = r.id === melhor.r.id && prios.length > 0;
          return (
            <li
              key={r.id}
              className={`flex flex-col gap-3 rounded-[18px] border p-4 motion-safe:transition-colors ${
                destaque ? "border-gt-green bg-gt-safe-bg/60" : "border-gt-line bg-gt-card2"
              }`}
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
                  {i + 1}º · {r.rotulo}
                  {destaque ? " · mais alinhada às prioridades" : ""}
                </p>
                <h3 className="text-[17px] font-extrabold">{r.nome}</h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {r.riscoCalculado ? (
                  <>
                    <SeloNivel nivel={nivelGeada} rotulo="Geada" />
                    <SeloNivel nivel={nivelSeca} rotulo="Seca" />
                  </>
                ) : (
                  <SeloNivel nivel="Não calculado" rotulo="Clima" />
                )}
                <SeloNivel nivel={r.erosao} rotulo="Erosão" />
              </div>

              <p className="rounded-xl bg-gt-bg/60 p-2.5 text-sm">
                {r.riscoCalculado ? (
                  <>
                    Milho: geada em <b>{geada.anosComEvento}</b> e seca em <b>{d.seca.anosComEvento}</b> de{" "}
                    <b>{geada.totalAnos}</b> safras na fase crítica ({ddmm(d.faseInicio)}–{ddmm(d.faseFim)}). Fonte: NASA POWER.
                  </>
                ) : (
                  r.riscoQualitativo
                )}
              </p>

              {prios.length > 0 && (
                <dl className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                  {prios.map((p) => (
                    <div key={p} className="contents">
                      <dt className="text-gt-muted">{PRIORIDADES.find((x) => x.id === p)?.label}</dt>
                      <dd>
                        <Pontos n={r.atende[p]} />
                      </dd>
                    </div>
                  ))}
                  <dt className="font-mono text-[11px] text-gt-faint">Soma (qualitativa)</dt>
                  <dd className="font-mono text-xs font-semibold">{soma}</dd>
                </dl>
              )}

              <p className="text-sm">{r.justificativa}</p>
              <Lista titulo="Evidência" itens={r.evidencia} cor="text-gt-frost" />
              <Lista titulo="Benefícios" itens={r.beneficios} cor="text-gt-green" />
              <Lista titulo="Riscos" itens={r.riscos} cor="text-gt-orange" />
              <Lista titulo="Lacunas · confirmar com o agrônomo" itens={r.lacunas} cor="text-gt-faint" />
              <p className="text-xs text-gt-faint">Solo descoberto: {r.soloDescoberto}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 rounded-xl border border-gt-risk-line bg-gt-risk-bg p-3 text-sm text-gt-risk-text">
        Textos agronômicos, níveis de erosão e quanto cada rotação atende às prioridades são qualitativos e estão{" "}
        <b>a validar com técnico</b>. A ferramenta apoia a decisão; não substitui o agricultor nem o agrônomo.
      </p>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-gt-faint">{REGRA_ORDEM}</p>
    </section>
  );
}
