"use client";

import { useState } from "react";
import type { DataView, TrigoView } from "@/lib/view-data";
import { FOCOS, MOTIVO_BLOQUEIO, NOTA_NITROGENIO, REGRA_ORDEM, RESTRICOES, type Foco, type Restricao } from "@/lib/rotacoes";
import {
  Broto,
  COR_AVALIACAO,
  Carinha,
  IcMilho,
  IcMilhoCapim,
  IcSoja,
  IcTrigo,
  SetaRotacao,
  type Avaliacao,
} from "@/components/wh/Arte";
import { CabecalhoInterno } from "@/components/wh/Moldura";
import { fraseDez, melhorDataGeada, type ModeloRotacoes, type RotacaoAvaliada } from "@/components/wh/modelo";
import { fmtDia, useLang, useT } from "@/lib/i18n";

const ROTULO_AVAL: Record<Avaliacao, { pt: string; en: string }> = {
  bom: { pt: "bom", en: "good" },
  atencao: { pt: "atenção", en: "caution" },
  ruim: { pt: "ruim", en: "poor" },
};

const NOME_CURTO: Record<string, { pt: string; en: string }> = {
  trigo: { pt: "Trigo", en: "Wheat" },
  "milho-braquiaria": { pt: "Milho + capim", en: "Corn + grass" },
  milho: { pt: "Milho", en: "Corn" },
};

const FOCO_CURTO: Record<Foco, { pt: string; en: string }> = {
  renda: { pt: "Renda", en: "Income" },
  "solo-agua": { pt: "Solo", en: "Soil" },
  equilibrio: { pt: "Os dois", en: "Both" },
};

function Selo({ a }: { a: Avaliacao }) {
  const t = useT();
  const c = COR_AVALIACAO[a];
  return (
    <span className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[15px] font-extrabold" style={{ background: c.fundo, color: c.cor }}>
      <Carinha a={a} size={26} />
      {t(ROTULO_AVAL[a].pt, ROTULO_AVAL[a].en)}
    </span>
  );
}

function Par({ id }: { id: string }) {
  const [fundo, icone] =
    id === "trigo"
      ? ["#F4EBD2", <IcTrigo key="t" />]
      : id === "milho-braquiaria"
        ? ["#FBEFD2", <IcMilhoCapim key="c" />]
        : ["#FBEFD2", <IcMilho key="m" />];
  return (
    <span aria-hidden="true" className="flex h-10 w-[102px] flex-none items-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#E3F2E1]">
        <IcSoja />
      </span>
      <svg width="22" height="40" viewBox="40 0 22 40">
        <SetaRotacao />
      </svg>
      <span className="flex size-10 items-center justify-center rounded-full" style={{ background: fundo }}>
        {icone}
      </span>
    </span>
  );
}

function CartaoRotacao({
  a,
  i,
  texto,
}: {
  a: RotacaoAvaliada;
  i: number;
  texto: string;
}) {
  const t = useT();
  const lang = useLang();
  const [aberto, setAberto] = useState(false);
  const x = lang === "en" ? a.r.en : a.r.pt;
  const fora = a.bloqueios.length > 0;
  const primeiro = i === 0 && !fora;
  const etiqueta = fora
    ? { pt: "NÃO SE APLICA", en: "NOT FOR YOU", cor: "#8A7F6A" }
    : primeiro
      ? { pt: "MELHOR PRA SUA DATA", en: "BEST FOR YOUR DATE", cor: "#2E7D4A" }
      : a.r.id === "milho-braquiaria"
        ? { pt: "MELHOR PRO SOLO", en: "BEST FOR THE SOIL", cor: "#3E6EA8" }
        : a.r.id === "milho"
          ? { pt: "O QUE VOCÊ FAZ HOJE", en: "WHAT YOU DO TODAY", cor: "#4A5A50" }
          : { pt: "OUTRA OPÇÃO", en: "ANOTHER OPTION", cor: "#4A5A50" };
  return (
    <article
      className={`wh-in flex flex-col gap-3.5 rounded-3xl bg-white p-[18px] ${fora ? "opacity-75" : ""}`}
      style={{ animationDelay: `${0.1 + i * 0.06}s`, border: primeiro ? "2px solid #2E7D4A" : "1px solid #E3DDCF" }}
    >
      <span className="self-start rounded-full px-3 py-[5px] text-[13px] font-extrabold tracking-[0.02em] text-white" style={{ background: etiqueta.cor }}>
        {t(etiqueta.pt, etiqueta.en)}
      </span>
      <div className="flex items-center gap-3">
        <Par id={a.r.id} />
        <h2 className="m-0 text-[21px] font-black leading-[1.15] tracking-normal">{x.nome}</h2>
      </div>
      {fora && (
        <p className="m-0 rounded-xl bg-[#FBEBC8] px-3 py-2 text-[15px] text-[#7A520F]">
          {t("Você marcou que não consegue: ", "You said you can’t: ")}
          {t(MOTIVO_BLOQUEIO[a.bloqueios[0]].pt, MOTIVO_BLOQUEIO[a.bloqueios[0]].en)}.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {(
          [
            [t("Geada", "Frost"), a.geada],
            [t("Cuidado com o solo", "Soil care"), a.solo],
            [t("Renda", "Income"), a.renda],
          ] as [string, Avaliacao][]
        ).map(([r, v]) => (
          <div key={r} className="flex items-center justify-between">
            <span className="text-base">{r}</span>
            <Selo a={v} />
          </div>
        ))}
      </div>
      <p className="m-0 text-[15px] leading-[1.45] text-texto-2">{texto}</p>
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={`min-h-12 cursor-pointer rounded-full text-base font-extrabold ${
          primeiro ? "border-none bg-lavoura text-white" : "border-[1.5px] border-[#D6CFBE] bg-white text-texto"
        }`}
      >
        {aberto ? t("Fechar detalhes", "Hide details") : t("Ver detalhes", "See details")}
      </button>
      {aberto && (
        <div className="flex flex-col gap-3 rounded-2xl bg-campo p-3.5 text-[15px] leading-[1.45]">
          <p className="m-0">{x.justificativa}</p>
          {(
            [
              [t("Evidência", "Evidence"), x.evidencia, "#2F5A92"],
              [t("Benefícios", "Benefits"), x.beneficios, "#2E7D4A"],
              [t("Riscos", "Risks"), x.riscos, "#9A3D0B"],
              [t("Confirmar com o agrônomo", "Confirm with an agronomist"), x.lacunas, "#4A5A50"],
            ] as [string, string[], string][]
          ).map(([titulo, itens, cor]) => (
            <div key={titulo}>
              <p className="m-0 text-sm font-extrabold" style={{ color: cor }}>
                {titulo}
              </p>
              <ul className="m-0 mt-1 list-disc pl-5 text-texto-2">
                {itens.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="m-0 text-sm text-texto-2">
            {t("Solo descoberto:", "Bare soil:")} {x.soloDescoberto}
          </p>
        </div>
      )}
    </article>
  );
}

export function TelaRotacoes({
  nomeLocal,
  d,
  datas,
  trigo,
  baixada,
  modelo,
  foco,
  onFoco,
  restricoes,
  onRestricao,
  onVoltar,
}: {
  nomeLocal: string;
  d: DataView;
  datas: DataView[];
  trigo: TrigoView;
  baixada: boolean;
  modelo: ModeloRotacoes;
  foco: Foco;
  onFoco: (f: Foco) => void;
  restricoes: Restricao[];
  onRestricao: (r: Restricao) => void;
  onVoltar?: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const geada = baixada ? d.geadaBaixada : d.geada;
  const fGeada = fraseDez(geada, lang);
  const ate = melhorDataGeada(datas, baixada);
  const alvo = datas[ate];
  const gAlvo = baixada ? alvo.geadaBaixada : alvo.geada;
  const idx = datas.findIndex((x) => x.dataSoja === d.dataSoja);
  const nomeMelhor = lang === "en" ? modelo.melhor.r.en.nome : modelo.melhor.r.pt.nome;

  const texto = (a: RotacaoAvaliada) =>
    a.r.id === "milho"
      ? t(
          `Rende mais quando dá certo, mas com soja em ${dia(d.dataSoja)} a flor pega geada em ${fGeada}.`,
          `Pays the most when it works, but with soybeans on ${dia(d.dataSoja)} the flowers meet frost in ${fGeada}.`,
        )
      : a.r.id === "milho-braquiaria"
        ? t(
            `Capim cobre o chão depois do milho. A flor do milho pega geada em ${fGeada}.`,
            `Grass covers the ground after the corn. The corn flowers meet frost in ${fGeada}.`,
          )
        : t(
            `Geada na espiga do trigo em ${fraseDez(modelo.geadaTrigo, lang)} (semeado em ${dia(trigo.semeadura)}), para qualquer data da soja.`,
            `Frost at wheat heading in ${fraseDez(modelo.geadaTrigo, lang)} (sown on ${dia(trigo.semeadura)}), for any soybean date.`,
          );

  return (
    <>
      <CabecalhoInterno
        titulo={t("O que plantar depois da soja?", "What to plant after soybeans?")}
        subtitulo={t(`${nomeLocal} · soja em ${dia(d.dataSoja)}`, `${nomeLocal} · soybeans on ${dia(d.dataSoja)}`)}
        onVoltar={onVoltar}
      />
      <main className="-mt-6 flex flex-col gap-3.5 px-4 pb-10">
        <section className="flex flex-col gap-2.5 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(20,35,26,.07)]">
          <span id="wh-foco" className="text-base font-extrabold">
            {t("O que pesa mais pra você?", "What matters most to you?")}
          </span>
          <div role="radiogroup" aria-labelledby="wh-foco" className="grid grid-cols-3 gap-1.5">
            {FOCOS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={foco === f.id}
                onClick={() => onFoco(f.id)}
                className={`min-h-12 cursor-pointer rounded-full border-none text-[15px] font-extrabold ${
                  foco === f.id ? "bg-texto text-white" : "bg-campo text-texto"
                }`}
              >
                {t(FOCO_CURTO[f.id].pt, FOCO_CURTO[f.id].en)}
              </button>
            ))}
          </div>
        </section>

        <section className="wh-in rounded-3xl bg-white px-4 pb-1.5 pt-4 shadow-[0_6px_20px_rgba(20,35,26,.07)]">
          <table className="w-full border-collapse">
            <caption className="sr-only">{t("Resumo das opções", "Summary of the options")}</caption>
            <thead>
              <tr>
                <th scope="col" className="pb-2 text-left align-bottom text-[17px] font-black">
                  {t("Resumo", "Summary")}
                </th>
                {[t("Geada", "Frost"), t("Solo", "Soil"), t("Renda", "Income")].map((c) => (
                  <th key={c} scope="col" className="w-[52px] pb-2 text-center align-bottom text-[13px] font-bold text-texto-2">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelo.avaliadas.map((a) => (
                <tr key={a.r.id} className="h-[52px] border-t border-divisor">
                  <th scope="row" className="text-left text-[15px] font-extrabold">
                    {t(NOME_CURTO[a.r.id].pt, NOME_CURTO[a.r.id].en)}
                  </th>
                  {[a.geada, a.solo, a.renda].map((v, k) => (
                    <td key={k} className="text-center">
                      <span className="inline-flex" title={t(ROTULO_AVAL[v].pt, ROTULO_AVAL[v].en)}>
                        <Carinha a={v} />
                        <span className="sr-only">{t(ROTULO_AVAL[v].pt, ROTULO_AVAL[v].en)}</span>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="flex justify-center gap-3.5">
          {(["bom", "atencao", "ruim"] as Avaliacao[]).map((a) => (
            <span key={a} className="flex items-center gap-1 text-sm font-bold" style={{ color: COR_AVALIACAO[a].cor }}>
              <Carinha a={a} size={22} />
              {t(ROTULO_AVAL[a].pt, ROTULO_AVAL[a].en)}
            </span>
          ))}
        </div>

        <section className="flex items-start gap-3 rounded-3xl bg-[#E6F4E4] p-4">
          <Broto size={52} bob={false} className="flex-none" />
          <div className="flex flex-1 flex-col gap-1 rounded-[18px_18px_18px_4px] bg-white px-3.5 py-3">
            <span className="text-[13px] font-extrabold text-lavoura">{t("Dica do Broto", "Broto’s tip")}</span>
            <span className="text-base font-bold leading-[1.35]">
              {t(`Com soja em ${dia(d.dataSoja)}, a opção mais indicada pra você é `, `With soybeans on ${dia(d.dataSoja)}, the best option for you is `)}
              <strong>{nomeMelhor}</strong>.
              {ate < idx &&
                t(
                  ` Plantando a soja em ${dia(alvo.dataSoja)}, a geada no milho cai para ${fraseDez(gAlvo, lang)}.`,
                  ` Planting soybeans on ${dia(alvo.dataSoja)}, frost on the corn drops to ${fraseDez(gAlvo, lang)}.`,
                )}
            </span>
          </div>
        </section>

        {modelo.avaliadas.map((a, i) => (
          <CartaoRotacao key={a.r.id} a={a} i={i} texto={texto(a)} />
        ))}

        <details className="rounded-[18px] bg-white px-4">
          <summary className="flex min-h-[52px] cursor-pointer items-center text-base font-bold">{t("Detalhes técnicos", "Technical details")}</summary>
          <div className="flex flex-col gap-3 pb-4">
            <fieldset className="m-0 flex flex-col gap-1 border-none p-0">
              <legend className="mb-1 text-[15px] font-extrabold">{t("O que você não consegue fazer?", "What can’t you do?")}</legend>
              {RESTRICOES.map((k) => (
                <label key={k.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                  <input
                    type="checkbox"
                    checked={restricoes.includes(k.id)}
                    onChange={() => onRestricao(k.id)}
                    className="size-5 accent-[#2E7D4A]"
                  />
                  {t(k.pt, k.en)}
                </label>
              ))}
            </fieldset>
            <ul className="m-0 pl-[18px] text-[15px] leading-[1.7] text-texto-2">
              <li>{t("Anos de El Niño / La Niña parecidos com este", "El Niño / La Niña years similar to this one")}</li>
              <li>{t("Relevo da lavoura (satélite)", "Field relief (satellite)")}</li>
              <li>{t("Produtividade histórica do município (IBGE)", "Historical municipal yield (IBGE)")}</li>
              <li>{t("Glossário e fontes: NASA POWER, NOAA, MAPA, Deral", "Glossary and sources: NASA POWER, NOAA, MAPA, Deral")}</li>
            </ul>
            <p className="m-0 text-sm leading-[1.5] text-texto-2">{t(REGRA_ORDEM.pt, REGRA_ORDEM.en)}</p>
            <p className="m-0 text-sm leading-[1.5] text-texto-2">{t(NOTA_NITROGENIO.pt, NOTA_NITROGENIO.en)}</p>
          </div>
        </details>
        <p className="m-0 px-1 text-sm leading-[1.5] text-texto-2">
          {t(
            "Os números mostram com que frequência o clima atrapalhou no passado. Não garantem a próxima safra. Converse com seu agrônomo antes de decidir.",
            "The numbers show how often the weather got in the way in the past. They do not guarantee the next season. Talk to your agronomist before deciding.",
          )}
        </p>
      </main>
    </>
  );
}
