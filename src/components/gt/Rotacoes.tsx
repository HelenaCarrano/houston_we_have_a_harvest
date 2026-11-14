"use client";

import { useState } from "react";
import type { DataView } from "@/lib/view-data";
import { ROTACOES, PRIORIDADES, NOTA_NITROGENIO, REGRA_ORDEM, type Prioridade } from "@/lib/rotacoes";
import { NIVEL_EN, fmtDia, useLang, useT } from "@/lib/i18n";

type Nivel = "Baixo" | "Médio" | "Alto";
const PESO_NIVEL: Record<Nivel, number> = { Baixo: 0, Médio: 1, Alto: 2 };

function nivelPorFreq(f: number): Nivel {
  const x = Math.round(f * 10);
  return x <= 1 ? "Baixo" : x <= 3 ? "Médio" : "Alto";
}

export function SeloNivel({ nivel, rotulo }: { nivel: Nivel | "Não calculado"; rotulo?: string }) {
  const t = useT();
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
      {t(nivel, NIVEL_EN[nivel] ?? nivel)}
    </span>
  );
}

function Pontos({ n }: { n: number }) {
  return (
    <span aria-label={`${n}/3`} className="inline-flex gap-0.5 align-middle">
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
        {itens.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function Rotacoes({
  d,
  nomeLocal,
  baixada,
  filtroRotulo = "",
}: {
  d: DataView;
  nomeLocal: string;
  baixada: boolean;
  /** Filtro de El Niño/La Niña ativo (vazio = todos os anos). */
  filtroRotulo?: string;
}) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
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
        {t("Comparar rotações", "Compare rotations")} · {nomeLocal} · {t("soja em", "soybean on")} {dia(d.dataSoja)}
        {baixada ? ` · ${t("baixada", "lowland")}` : ""}
        {filtroRotulo ? ` · ${filtroRotulo}` : ""}
      </p>
      <h2 className="mt-1 text-2xl font-black">{t("O que plantar depois da soja?", "What to plant after soybean?")}</h2>

      <div className="mt-4">
        <p className="text-sm text-gt-muted">
          {t(
            "O que importa para você nesta safra? (marque uma ou mais)",
            "What matters to you this season? (tick one or more)",
          )}
        </p>
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="group"
          aria-label={t("Prioridades do agricultor", "Farmer priorities")}
        >
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
                {t(p.pt, p.en)}
              </button>
            );
          })}
        </div>
        {prios.includes("nitrogenio") && (
          <p className="mt-2 rounded-xl border border-gt-frost-line bg-gt-frost-bg p-3 text-sm text-gt-frost-text">
            {t(NOTA_NITROGENIO.pt, NOTA_NITROGENIO.en)}
          </p>
        )}
      </div>

      <ol className="mt-5 grid gap-4 lg:grid-cols-3">
        {avaliadas.map(({ r, soma }, i) => {
          const x = lang === "en" ? r.en : r.pt;
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
                  #{i + 1} · {x.rotulo}
                  {destaque ? ` · ${t("mais alinhada às prioridades", "best matches your priorities")}` : ""}
                </p>
                <h3 className="text-[17px] font-extrabold">{x.nome}</h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {r.riscoCalculado ? (
                  <>
                    <SeloNivel nivel={nivelGeada} rotulo={t("Geada", "Frost")} />
                    <SeloNivel nivel={nivelSeca} rotulo={t("Seca", "Drought")} />
                  </>
                ) : (
                  <SeloNivel nivel="Não calculado" rotulo={t("Clima", "Climate")} />
                )}
                <SeloNivel nivel={d.campo[r.id].nivelErosao} rotulo={t("Erosão", "Erosion")} />
              </div>

              <p className="rounded-xl bg-gt-bg/60 p-2.5 text-sm">
                {r.riscoCalculado ? (
                  <>
                    {t("Milho: geada em ", "Corn: frost in ")}
                    <b>{geada.anosComEvento}</b>
                    {t(" e seca em ", " and drought in ")}
                    <b>{d.seca.anosComEvento}</b> {t("de", "of")} <b>{geada.totalAnos}</b>{" "}
                    {t("safras na fase crítica", "seasons in the critical stage")} ({dia(d.faseInicio)}–{dia(d.faseFim)}).{" "}
                    {t("Fonte: NASA POWER.", "Source: NASA POWER.")}
                  </>
                ) : (
                  x.riscoQualitativo
                )}
              </p>

              {prios.length > 0 && (
                <dl className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                  {prios.map((p) => {
                    const pr = PRIORIDADES.find((q) => q.id === p)!;
                    return (
                      <div key={p} className="contents">
                        <dt className="text-gt-muted">{t(pr.pt, pr.en)}</dt>
                        <dd>
                          <Pontos n={r.atende[p]} />
                        </dd>
                      </div>
                    );
                  })}
                  <dt className="font-mono text-[11px] text-gt-faint">{t("Soma (qualitativa)", "Sum (qualitative)")}</dt>
                  <dd className="font-mono text-xs font-semibold">{soma}</dd>
                </dl>
              )}

              <p className="text-sm">{x.justificativa}</p>
              <Lista titulo={t("Evidência", "Evidence")} itens={x.evidencia} cor="text-gt-frost" />
              <Lista titulo={t("Benefícios", "Benefits")} itens={x.beneficios} cor="text-gt-green" />
              <Lista titulo={t("Riscos", "Risks")} itens={x.riscos} cor="text-gt-orange" />
              <Lista
                titulo={t("Lacunas · confirmar com o agrônomo", "Information gaps · confirm with an agronomist")}
                itens={x.lacunas}
                cor="text-gt-faint"
              />
              <p className="text-xs text-gt-faint">
                {t("Solo descoberto:", "Bare soil:")} {x.soloDescoberto}{" "}
                {t(
                  `(${d.campo[r.id].diasDescoberto} dias do ano sem cultura)`,
                  `(${d.campo[r.id].diasDescoberto} days a year without a crop)`,
                )}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 rounded-xl border border-gt-risk-line bg-gt-risk-bg p-3 text-sm text-gt-risk-text">
        {t(
          "Textos agronômicos e quanto cada rotação atende às prioridades são qualitativos; o nível de erosão vem dos dias sem cultura (ciclos de exemplo) e ignora o declive. Tudo está ",
          "Agronomic texts and how well each rotation meets the priorities are qualitative; the erosion level comes from the days without a crop (example cycles) and ignores slope. Everything is ",
        )}
        <b>{t("a validar com técnico", "to be validated with an agronomist")}</b>
        {t(
          ". A ferramenta apoia a decisão; não substitui o agricultor nem o agrônomo.",
          ". This tool supports the decision; it does not replace the farmer or the agronomist.",
        )}
      </p>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-gt-faint">{t(REGRA_ORDEM.pt, REGRA_ORDEM.en)}</p>
    </section>
  );
}
