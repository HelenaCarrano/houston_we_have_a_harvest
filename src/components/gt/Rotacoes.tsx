"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
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
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { Fonte } from "@/components/ui/Fonte";
import { NivelBadge, nivelPorFreq, type Nivel } from "@/components/ui/NivelBadge";
import { Segmented } from "@/components/ui/Segmented";
import { fmtDia, useLang, useT } from "@/lib/i18n";

const PESO_NIVEL: Record<Nivel, number> = { Baixo: 0, Médio: 1, Alto: 2 };

function Pontos({ n }: { n: number }) {
  return (
    <span aria-label={`${n}/3`} className="inline-flex gap-0.5 align-middle">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`inline-block size-2.5 rounded-full ${i <= n ? "bg-brand" : "bg-line"}`} />
      ))}
    </span>
  );
}

function Lista({ titulo, itens, cor }: { titulo: string; itens: string[]; cor: string }) {
  return (
    <div>
      <p className={`text-sm font-semibold ${cor}`}>{titulo}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-ink-muted">
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

  /** Texto de resumo (mesmo conteúdo para "Copiar" e para o WhatsApp). */
  const montarResumo = (): string => {
    const linhas = [
      `weharvest · ${nomeLocal} · ${t("soja em", "soybean on")} ${dia(d.dataSoja)}${baixada ? " · " + t("baixada", "lowland") : ""}`,
      `${t("Para o seu campo", "For your field")}: ${txt(melhor.r).nome}. ${motivo}${climaMilho}`,
      ...avaliadas.map((a, i) => {
        const k = a.bloqueios[0];
        return `${i + 1}. ${txt(a.r).nome}${k ? " — " + t("não se aplica: ", "not applicable: ") + t(MOTIVO_BLOQUEIO[k].pt, MOTIVO_BLOQUEIO[k].en) : ""}`;
      }),
      `${t("Dados: NASA POWER, 1981–2025. Apoio à decisão, a validar com técnico.", "Data: NASA POWER, 1981–2025. Decision support, to be validated with an agronomist.")}`,
    ];
    return linhas.join("\n");
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(montarResumo());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <Card>
      <CardHeader title={t("O que plantar depois da soja?", "What to plant after soybeans?")} />
      <p className="mt-1 text-ink-muted">
        {t(
          "Compare 3 opções para o seu campo. Diga o que importa e o que você não consegue fazer.",
          "Compare 3 options for your field. Tell us what matters and what you can’t do.",
        )}
      </p>

      <div className="mt-4 grid gap-4 rounded-xl bg-surface-2 p-4 md:grid-cols-2">
        <div>
          <p className="font-bold">{t("O que pesa mais para você?", "What matters most to you?")}</p>
          <Segmented<Foco>
            label={t("O que pesa mais", "What matters most")}
            value={foco}
            onChange={setFoco}
            redondo={false}
            className="mt-2 !bg-surface"
            options={FOCOS.map((f) => ({ id: f.id, label: t(f.pt, f.en) }))}
          />
        </div>
        <div>
          <p className="font-bold">{t("Não consigo…", "I can’t…")}</p>
          <div className="mt-1 flex flex-col" role="group" aria-label={t("Restrições", "Constraints")}>
            {RESTRICOES.map((k) => (
              <label key={k.id} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={restricoes.includes(k.id)}
                  onChange={() => toggle(k.id)}
                  className="size-5 accent-[#2C6A38]"
                />
                <span>{t(k.pt, k.en)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <ol className="mt-5 grid gap-3">
        {avaliadas.map(({ r, soma, bloqueios }, i) => {
          const x = lang === "en" ? r.en : r.pt;
          const destaque = r.id === melhor.r.id && bloqueios.length === 0;
          const fora = bloqueios.length > 0;
          return (
            <li
              key={r.id}
              className={`flex gap-4 rounded-xl border p-4 ${
                fora ? "border-line bg-surface-2 opacity-80" : destaque ? "border-2 border-brand bg-surface" : "border-line bg-surface"
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold ${
                  destaque ? "bg-brand text-white" : "bg-surface-2 text-ink-muted"
                } ${fora ? "!bg-line" : ""}`}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div>
                  <h3 className="text-lg font-bold">
                    <span className="sr-only">{i + 1}. </span>
                    {x.nome}
                  </h3>
                  <p className="text-sm text-ink-muted">{x.rotulo}</p>
                </div>
                {destaque && (
                  <div>
                    <span className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[13px] font-semibold text-brand">
                      {t("Mais indicada para você", "Best fit for you")}
                    </span>
                    <p className="mt-2 text-sm">
                      {motivo}
                      {climaMilho}
                    </p>
                  </div>
                )}
                {fora && (
                  <Callout tom="cautela">
                    <p className="text-sm">
                      {t("Não se aplica a você: ", "Not applicable to you: ")}
                      {t(MOTIVO_BLOQUEIO[bloqueios[0]].pt, MOTIVO_BLOQUEIO[bloqueios[0]].en)}.
                    </p>
                  </Callout>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {r.riscoCalculado ? (
                    <>
                      <NivelBadge nivel={nivelGeada} prefixo={t("Geada", "Frost")} />
                      <NivelBadge nivel={nivelSeca} prefixo={t("Seca", "Drought")} />
                    </>
                  ) : (
                    <>
                      <NivelBadge nivel={geadaTrigo.nivel} prefixo={t("Geada", "Frost")} />
                      <NivelBadge nivel="Não calculado" prefixo={t("Seca", "Drought")} />
                    </>
                  )}
                  <NivelBadge nivel={d.campo[r.id].nivelErosao} prefixo={t("Erosão", "Erosion")} />
                </div>
                <p className="text-sm">{x.justificativa}</p>

                <Disclosure titulo={t("Ver detalhes", "See details")}>
                  <div className="flex flex-col gap-3">
                    <p className="rounded-xl bg-surface-2 p-3 text-sm">
                      {r.riscoCalculado ? (
                        <>
                          {t("Milho: geada em ", "Corn: frost in ")}
                          <b>{geada.anosComEvento}</b>
                          {t(" e seca em ", " and drought in ")}
                          <b>{d.seca.anosComEvento}</b> {t("de", "of")} <b>{geada.totalAnos}</b>{" "}
                          {t("safras na floração e enchimento", "seasons in the critical stage")} ({dia(d.faseInicio)}–{dia(d.faseFim)}).{" "}
                          {t("Fonte: NASA POWER.", "Source: NASA POWER.")}
                        </>
                      ) : (
                        <>
                          {t("Trigo: geada no espigamento (", "Wheat: frost at heading (")}
                          {dia(trigo.janela.inicio)}–{dia(trigo.janela.fim)}
                          {t(`, semeadura em ${dia(trigo.semeadura)}) em `, `, sowing on ${dia(trigo.semeadura)}) in `)}
                          <b>{geadaTrigo.anosComEvento}</b> {t("de", "of")} <b>{geadaTrigo.totalAnos}</b> {t("safras", "seasons")}
                          {geadaTrigo.anosFortes && geadaTrigo.anosFortes.length > 0
                            ? t(
                                `; geada forte (≤ ${trigo.limiteForteC + (baixada ? trigo.ajusteBaixadaC : 0)} °C) em ${geadaTrigo.anosFortes.length}`,
                                `; strong frost (≤ ${trigo.limiteForteC + (baixada ? trigo.ajusteBaixadaC : 0)} °C) in ${geadaTrigo.anosFortes.length}`,
                              )
                            : ""}
                          .{" "}
                          {t(
                            "Seca do trigo não calculada. O mesmo resultado vale para qualquer data da soja. Fonte: NASA POWER.",
                            "Wheat drought is not calculated. The same result holds for any soybean date. Source: NASA POWER.",
                          )}
                          <span className="mt-1.5 block text-ink-muted">
                            {t("Por data de semeadura: ", "By sowing date: ")}
                            {sensTrigo.map((s, k) => (
                              <span key={s.semeadura}>
                                {k > 0 ? " · " : ""}
                                {dia(s.semeadura)}: <b>{s.anosComEvento}</b>/{s.totalAnos}
                              </span>
                            ))}
                            .{" "}
                            {t(
                              "O resultado depende muito da data de semeadura e da janela de 70–110 dias (hipóteses): confira a janela do ZARC. Semeadura mais tarde pode atrasar a colheita e a próxima soja.",
                              "The result depends strongly on the sowing date and the 70–110-day window (hypotheses): check the ZARC window. Later sowing may delay harvest and the next soybean.",
                            )}
                          </span>
                          {filtroRotulo && (
                            <span className="mt-1.5 block text-ink-faint">
                              {t(
                                "O filtro de El Niño/La Niña não é aplicado ao trigo.",
                                "The El Niño/La Niña filter is not applied to wheat.",
                              )}
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
                              <dt className="text-ink-muted">{t(pr.pt, pr.en)}</dt>
                              <dd>
                                <Pontos n={r.atende[p]} />
                              </dd>
                            </div>
                          );
                        })}
                        <dt className="text-[13px] text-ink-faint">{t("Soma (qualitativa)", "Sum (qualitative)")}</dt>
                        <dd className="text-sm font-semibold tabular-nums">{soma}</dd>
                      </dl>
                    )}

                    <Lista titulo={t("Evidência", "Evidence")} itens={x.evidencia} cor="text-frost-ink" />
                    <Lista titulo={t("Benefícios", "Benefits")} itens={x.beneficios} cor="text-low" />
                    <Lista titulo={t("Riscos", "Risks")} itens={x.riscos} cor="text-high" />
                    <Lista
                      titulo={t("Lacunas · confirmar com o agrônomo", "Information gaps · confirm with an agronomist")}
                      itens={x.lacunas}
                      cor="text-ink-faint"
                    />
                    <Fonte>
                      {t("Solo descoberto:", "Bare soil:")} {x.soloDescoberto}{" "}
                      {t(
                        `(${d.campo[r.id].diasDescoberto} dias do ano sem cultura)`,
                        `(${d.campo[r.id].diasDescoberto} days a year without a crop)`,
                      )}
                    </Fonte>
                  </div>
                </Disclosure>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button href={"https://wa.me/?text=" + encodeURIComponent(montarResumo())} target="_blank" rel="noreferrer">
          <Share2 className="size-5" aria-hidden="true" />
          {t("Enviar no WhatsApp", "Send on WhatsApp")}
        </Button>
        <Button variant="secondary" onClick={copiar}>
          {copiado ? <Check className="size-5" aria-hidden="true" /> : <Copy className="size-5" aria-hidden="true" />}
          {copiado ? t("Copiado", "Copied") : t("Copiar texto", "Copy text")}
        </Button>
        <span className="sr-only" role="status">
          {copiado ? t("Resumo copiado", "Summary copied") : ""}
        </span>
      </div>

      <Disclosure
        className="mt-4"
        titulo={t("Como ordenamos e o que precisa de técnico", "How we rank them and what needs an agronomist")}
      >
        <div className="flex flex-col gap-3">
          <Callout tom="cautela">
            <p className="text-sm">
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
          </Callout>
          <Fonte>{t(REGRA_ORDEM.pt, REGRA_ORDEM.en)}</Fonte>
          <p className="text-sm text-ink-muted">{t(NOTA_NITROGENIO.pt, NOTA_NITROGENIO.en)}</p>
        </div>
      </Disclosure>
    </Card>
  );
}
