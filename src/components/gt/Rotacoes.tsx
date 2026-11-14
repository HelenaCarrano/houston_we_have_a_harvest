"use client";

import { useState } from "react";
import type { DataView } from "@/lib/view-data";
import {
  ROTACOES,
  PESOS,
  REGRA_PONTUACAO,
  notaRiscoPorFrequencia,
  type Prioridade,
} from "@/lib/rotacoes";

const PRIORIDADES: { id: Prioridade; label: string }[] = [
  { id: "renda", label: "Renda" },
  { id: "risco", label: "Menos risco" },
  { id: "solo", label: "Solo" },
];

const ddmm = (mmdd: string) => `${mmdd.slice(3, 5)}/${mmdd.slice(0, 2)}`;

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
      <p className={`font-mono text-[11px] uppercase tracking-wider ${cor}`}>{titulo}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
        {itens.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export function Rotacoes({ d, nomeLocal }: { d: DataView; nomeLocal: string }) {
  const [prio, setPrio] = useState<Prioridade>("risco");

  // anos com geada OU seca no milho, para a data escolhida
  const anosRuins = new Set([...d.geada.anos, ...d.seca.anos]);
  const totalAnos = Math.min(d.geada.totalAnos, d.seca.totalAnos);
  const freqMilho = totalAnos ? anosRuins.size / totalAnos : 0;
  const notaRiscoMilho = notaRiscoPorFrequencia(freqMilho);

  const avaliadas = ROTACOES.map((r) => {
    const notaRisco = r.riscoCalculado ? notaRiscoMilho : (r.notaRiscoQualitativa ?? 2);
    const w = PESOS[prio];
    const pontos = r.notaRenda * w.renda + notaRisco * w.risco + r.notaSolo * w.solo;
    return { r, notaRisco, pontos };
  }).sort((a, b) => b.pontos - a.pontos);

  const melhor = avaliadas[0].pontos;

  return (
    <section className="rounded-2xl border border-gt-line bg-gt-card p-4 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-wider text-gt-muted">
        Comparar rotações · {nomeLocal} · soja em {ddmm(d.dataSoja)}
      </p>
      <h2 className="mt-1 text-2xl font-bold">O que plantar depois da soja?</h2>

      <div className="mt-4">
        <p className="text-sm text-gt-muted">O que é mais importante para você nesta safra?</p>
        <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Prioridade do agricultor">
          {PRIORIDADES.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={prio === p.id}
              onClick={() => setPrio(p.id)}
              className={`min-h-11 rounded-xl border px-3 font-semibold ${
                prio === p.id
                  ? "border-gt-green bg-gt-green text-gt-bg"
                  : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-5 grid gap-4 lg:grid-cols-3">
        {avaliadas.map(({ r, notaRisco, pontos }, i) => (
          <li
            key={r.id}
            className={`flex flex-col gap-3 rounded-xl border p-4 ${
              pontos === melhor ? "border-gt-green bg-gt-green/5" : "border-gt-line bg-gt-card2"
            }`}
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-gt-muted">
                {i + 1}º · {r.rotulo}
              </p>
              <h3 className="text-lg font-bold">{r.nome}</h3>
              <p className="font-mono text-xs text-gt-muted">
                Pontuação <b className="text-gt-text">{pontos}</b> / 12
              </p>
            </div>

            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 text-sm">
              <dt className="text-gt-muted">Renda</dt>
              <dd>
                <Pontos n={r.notaRenda} /> <span className="text-xs text-gt-muted">qualitativa</span>
              </dd>
              <dt className="text-gt-muted">Risco climático</dt>
              <dd>
                <Pontos n={notaRisco} />{" "}
                <span className="text-xs text-gt-muted">{r.riscoCalculado ? "calculado" : "qualitativo"}</span>
              </dd>
              <dt className="text-gt-muted">Solo</dt>
              <dd>
                <Pontos n={r.notaSolo} /> <span className="text-xs text-gt-muted">qualitativa</span>
              </dd>
            </dl>

            <p className="rounded-lg bg-gt-bg/60 p-2 text-sm">
              {r.riscoCalculado ? (
                <>
                  Milho com geada ou seca em <b>{anosRuins.size}</b> de <b>{totalAnos}</b> safras (geada{" "}
                  {d.geada.anosComEvento}, seca {d.seca.anosComEvento}). Fonte: NASA POWER.
                </>
              ) : (
                r.notaRiscoTexto
              )}
            </p>

            <p className="text-sm">{r.justificativa}</p>
            <Lista titulo="Evidência" itens={r.evidencia} cor="text-gt-frost" />
            <Lista titulo="Benefícios" itens={r.beneficios} cor="text-gt-green" />
            <Lista titulo="Riscos" itens={r.riscos} cor="text-gt-orange" />
            <Lista titulo="Lacunas — confirmar com o agrônomo" itens={r.lacunas} cor="text-gt-muted" />
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-lg border border-gt-orange/50 bg-gt-orange/10 p-3 text-sm">
        Textos agronômicos e notas de renda e solo são qualitativos e estão <b>a validar com técnico</b>. A ferramenta
        apoia a decisão; não substitui o agricultor nem o agrônomo.
      </p>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-gt-muted">Regra de pontuação: {REGRA_PONTUACAO}</p>
    </section>
  );
}
