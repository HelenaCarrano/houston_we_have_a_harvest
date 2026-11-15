"use client";

import { useState } from "react";
import type { DataView, TrigoView } from "@/lib/view-data";
import {
  ROTACOES,
  PRIORIDADES,
  FOCOS,
  RESTRICOES,
  MOTIVO_BLOQUEIO,
  NOTA_NITROGENIO,
  REGRA_ORDEM,
  ordenarRotacoes,
  prioridadesDoCampo,
  type Foco,
  type Restricao,
} from "@/lib/rotacoes";
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
  trigo,
  nomeLocal,
  baixada,
  filtroRotulo = "",
}: {
  d: DataView;
  /** Geada no espigamento do trigo (não depende da data da soja). */
  trigo: TrigoView;
  nomeLocal: string;
  baixada: boolean;
  /** Filtro de El Niño/La Niña ativo (vazio = todos os anos). */
  filtroRotulo?: string;
}) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const [foco, setFoco] = useState<Foco>("equilibrio");
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [copiado, setCopiado] = useState(false);
  const toggle = (k: Restricao) =>
    setRestricoes((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]));
  const prios = prioridadesDoCampo(foco, restricoes);

  const geada = baixada ? d.geadaBaixada : d.geada;
  const nivelGeada = nivelPorFreq(geada.frequencia);
  const nivelSeca = nivelPorFreq(d.seca.frequencia);
  const geadaTrigo = baixada ? trigo.geadaBaixada : trigo.geada;
  const sensTrigo = baixada ? trigo.sensibilidadeBaixada : trigo.sensibilidade;
  const nivelClimaMilho: Nivel = PESO_NIVEL[nivelGeada] >= PESO_NIVEL[nivelSeca] ? nivelGeada : nivelSeca;

  // trigo: risco não calculado → neutro (1) no desempate
  const riscoPorRotacao = Object.fromEntries(
    ROTACOES.map((r) => [r.id, r.riscoCalculado ? PESO_NIVEL[nivelClimaMilho] : 1]),
  ) as Record<(typeof ROTACOES)[number]["id"], number>;
  const avaliadas = ordenarRotacoes(ROTACOES, prios, restricoes, riscoPorRotacao).map((o) => ({
    r: ROTACOES.find((q) => q.id === o.id)!,
    soma: o.soma,
    bloqueios: o.bloqueios,
  }));
  const melhor = avaliadas[0];
  const descartadas = avaliadas.filter((a) => a.bloqueios.length > 0);
  const txt = (r: (typeof ROTACOES)[number]) => (lang === "en" ? r.en : r.pt);
  const fortes = prios.filter((p) => melhor.r.atende[p] === 3).map((p) => PRIORIDADES.find((q) => q.id === p)!);
  const motivo =
    fortes.length > 0
      ? t("Atende bem: ", "Meets well: ") + fortes.map((p) => t(p.pt, p.en).toLowerCase()).join(", ") + "."
      : t("Melhor soma entre as opções que você consegue fazer.", "Best total among the options you can do.");
  const climaMilho = melhor.r.riscoCalculado
    ? t(
        ` Risco do milho nesta data: geada em ${geada.anosComEvento} e seca em ${d.seca.anosComEvento} de ${geada.totalAnos} safras.`,
        ` Corn risk on this date: frost in ${geada.anosComEvento} and drought in ${d.seca.anosComEvento} of ${geada.totalAnos} seasons.`,
      )
    : melhor.r.id === "trigo"
      ? t(
          ` Geada no espigamento do trigo: ${geadaTrigo.anosComEvento} de ${geadaTrigo.totalAnos} safras (depende da data de semeadura).`,
          ` Wheat frost at heading: ${geadaTrigo.anosComEvento} of ${geadaTrigo.totalAnos} seasons (depends on the sowing date).`,
        )
      : "";
  const descartadasTxt = descartadas
    .map((a) => {
      const k = a.bloqueios[0];
      return `${txt(a.r).nome} (${t(MOTIVO_BLOQUEIO[k].pt, MOTIVO_BLOQUEIO[k].en)})`;
    })
    .join("; ");

  const copiar = async () => {
    const linhas = [
      `weharvest · ${nomeLocal} · ${t("soja em", "soybean on")} ${dia(d.dataSoja)}${baixada ? " · " + t("baixada", "lowland") : ""}`,
      `${t("Para o seu campo", "For your field")}: ${txt(melhor.r).nome}. ${motivo}${climaMilho}`,
      ...avaliadas.map((a, i) => {
        const k = a.bloqueios[0];
        return `${i + 1}. ${txt(a.r).nome}${k ? " — " + t("não se aplica: ", "not applicable: ") + t(MOTIVO_BLOQUEIO[k].pt, MOTIVO_BLOQUEIO[k].en) : ""}`;
      }),
      `${t("Dados: NASA POWER, 1981–2025. Apoio à decisão, a validar com técnico.", "Data: NASA POWER, 1981–2025. Decision support, to be validated with an agronomist.")}`,
    ];
    try {
      await navigator.clipboard.writeText(linhas.join("\n"));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <section className="rounded-[22px] border border-gt-line bg-gt-card p-4 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
        {t("Comparar rotações", "Compare rotations")} · {nomeLocal} · {t("soja em", "soybean on")} {dia(d.dataSoja)}
        {baixada ? ` · ${t("baixada", "lowland")}` : ""}
        {filtroRotulo ? ` · ${filtroRotulo}` : ""}
      </p>
      <h2 className="mt-1 text-2xl font-black">{t("O que plantar depois da soja?", "What to plant after soybean?")}</h2>

      <div className="mt-4 rounded-2xl border border-gt-green bg-gt-safe-bg/60 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-green">
          {t("Para o seu campo", "For your field")}
        </p>
        <p className="mt-1 text-lg font-extrabold">{txt(melhor.r).nome}</p>
        <p className="mt-1 text-sm text-gt-muted">
          {motivo}
          {climaMilho}
          {descartadas.length > 0 && (
            <>
              {" "}
              {t("Fora da comparação:", "Not applicable to you:")} {descartadasTxt}.
            </>
          )}
        </p>
        <button
          onClick={copiar}
          className="mt-3 min-h-11 rounded-full border border-gt-btn-line bg-gt-card2 px-4 text-sm font-semibold text-gt-text hover:border-gt-faint"
        >
          {copiado ? t("✓ Copiado", "✓ Copied") : t("Copiar resumo", "Copy summary")}
        </button>
        <span className="sr-only" role="status">
          {copiado ? t("Resumo copiado", "Summary copied") : ""}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold">{t("O que pesa mais para você?", "What matters most to you?")}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t("O que pesa mais", "What matters most")}>
            {FOCOS.map((f) => (
              <button
                key={f.id}
                role="radio"
                aria-checked={foco === f.id}
                onClick={() => setFoco(f.id)}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                  foco === f.id
                    ? "border-gt-green bg-gt-green text-gt-bg"
                    : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-btn-line"
                }`}
              >
                {t(f.pt, f.en)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("O que você não consegue fazer?", "What can't you do?")}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t("Restrições", "Constraints")}>
            {RESTRICOES.map((k) => {
              const on = restricoes.includes(k.id);
              return (
                <button
                  key={k.id}
                  aria-pressed={on}
                  onClick={() => toggle(k.id)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                    on
                      ? "border-gt-orange bg-gt-risk-bg text-gt-risk-text"
                      : "border-gt-line bg-gt-card2 text-gt-text hover:border-gt-btn-line"
                  }`}
                >
                  {on ? "✕ " : ""}
                  {t(k.pt, k.en)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-gt-muted">{t(NOTA_NITROGENIO.pt, NOTA_NITROGENIO.en)}</p>

      <ol className="mt-5 grid gap-4 lg:grid-cols-3">
        {avaliadas.map(({ r, soma, bloqueios }, i) => {
          const x = lang === "en" ? r.en : r.pt;
          const destaque = r.id === melhor.r.id;
          const fora = bloqueios.length > 0;
          return (
            <li
              key={r.id}
              className={`flex flex-col gap-3 rounded-[18px] border p-4 motion-safe:transition-colors ${
                fora
                  ? "border-gt-line bg-gt-card2 opacity-70"
                  : destaque
                    ? "border-gt-green bg-gt-safe-bg/60"
                    : "border-gt-line bg-gt-card2"
              }`}
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
                  #{i + 1} · {x.rotulo}
                  {destaque && !fora ? ` · ${t("mais alinhada ao seu campo", "best fit for your field")}` : ""}
                </p>
                <h3 className="text-[17px] font-extrabold">{x.nome}</h3>
                {fora && (
                  <p className="mt-1 rounded-lg border border-gt-risk-line bg-gt-risk-bg p-2 text-sm text-gt-risk-text">
                    {t("Não se aplica ao seu campo: ", "Not applicable to your field: ")}
                    {t(MOTIVO_BLOQUEIO[bloqueios[0]].pt, MOTIVO_BLOQUEIO[bloqueios[0]].en)}.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {r.riscoCalculado ? (
                  <>
                    <SeloNivel nivel={nivelGeada} rotulo={t("Geada", "Frost")} />
                    <SeloNivel nivel={nivelSeca} rotulo={t("Seca", "Drought")} />
                  </>
                ) : (
                  <>
                    <SeloNivel nivel={geadaTrigo.nivel} rotulo={t("Geada", "Frost")} />
                    <SeloNivel nivel="Não calculado" rotulo={t("Seca", "Drought")} />
                  </>
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
                  <>
                    {t("Trigo: geada no espigamento (", "Wheat: frost at heading (")}
                    {dia(trigo.janela.inicio)}–{dia(trigo.janela.fim)}
                    {t(`, semeadura em ${dia(trigo.semeadura)}) em `, `, sowing on ${dia(trigo.semeadura)}) in `)}
                    <b>{geadaTrigo.anosComEvento}</b> {t("de", "of")} <b>{geadaTrigo.totalAnos}</b>{" "}
                    {t("safras", "seasons")}
                    {geadaTrigo.anosFortes && geadaTrigo.anosFortes.length > 0
                      ? t(`; geada forte (≤ ${trigo.limiteForteC + (baixada ? trigo.ajusteBaixadaC : 0)} °C) em ${geadaTrigo.anosFortes.length}`, `; strong frost (≤ ${trigo.limiteForteC + (baixada ? trigo.ajusteBaixadaC : 0)} °C) in ${geadaTrigo.anosFortes.length}`)
                      : ""}
                    . {t("Seca do trigo não calculada. O mesmo resultado vale para qualquer data da soja. Fonte: NASA POWER.", "Wheat drought is not calculated. The same result holds for any soybean date. Source: NASA POWER.")}
                    <span className="mt-1.5 block text-gt-muted">
                      {t("Por data de semeadura: ", "By sowing date: ")}
                      {sensTrigo.map((s, k) => (
                        <span key={s.semeadura}>
                          {k > 0 ? " · " : ""}
                          {dia(s.semeadura)}: <b>{s.anosComEvento}</b>/{s.totalAnos}
                        </span>
                      ))}
                      . {t(
                        "O resultado depende muito da data de semeadura e da janela de 70–110 dias (hipóteses): confira a janela do ZARC. Semeadura mais tarde pode atrasar a colheita e a próxima soja.",
                        "The result depends strongly on the sowing date and the 70–110-day window (hypotheses): check the ZARC window. Later sowing may delay harvest and the next soybean.",
                      )}
                    </span>
                    {filtroRotulo && (
                      <span className="mt-1.5 block text-gt-faint">
                        {t("O filtro de El Niño/La Niña não é aplicado ao trigo.", "The El Niño/La Niña filter is not applied to wheat.")}
                      </span>
                    )}
                  </>
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
