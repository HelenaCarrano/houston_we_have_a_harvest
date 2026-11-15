"use client";

import { useEffect, useState } from "react";
import type { DataView, LocalView } from "@/lib/view-data";
import {
  IcCheck,
  IcColheita,
  IcExclamacao,
  IcFlor,
  IcGeada,
  IcMilho,
  IcSoja,
  IcTempo,
} from "@/components/wh/Arte";
import { CabecalhoInterno } from "@/components/wh/Moldura";
import { anoDaSafra, dataNaSafra, diaEixo, diasEntre, fraseDez, hojeMMDD, linkGoogleAgenda, mesAbrev, somarDias } from "@/components/wh/modelo";
import { fmtDia, useLang, useT } from "@/lib/i18n";

export type LembreteId = "soja" | "colheita" | "milho" | "flor";

const LINHA = 44;
const TOPO = 40;
const ALTURA = TOPO + LINHA * 12;
const K = (LINHA * 12) / 365;
const y = (mmdd: string) => TOPO + diaEixo(mmdd) * K;
const MESES_EIXO = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7];

type Nota = { id: string; y: number; alto: number; no: React.ReactNode };

function Cartao({ titulo, sub, ponto, cor = "#14231A", fundo = "#FFFFFF" }: { titulo: string; sub: string; ponto: string; cor?: string; fundo?: string }) {
  return (
    <div
      className="flex min-h-[38px] flex-col justify-center rounded-xl px-2.5 py-[3px] shadow-[0_1px_4px_rgba(20,35,26,.10)]"
      style={{ background: fundo }}
    >
      <span className="flex items-center gap-1.5 text-sm font-extrabold leading-[1.15]" style={{ color: cor }}>
        <span className="size-[9px] flex-none rounded-full" style={{ background: ponto }} />
        {titulo}
      </span>
      <span className="pl-[15px] text-[13px] leading-[1.2] text-texto-2">{sub}</span>
    </div>
  );
}

function MesAMes({ d, local, cicloMilho, hoje }: { d: DataView; local: LocalView; cicloMilho: number; hoje: Date }) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const ep = local.epocaGeada;
  const hj = hojeMMDD(hoje);
  const jaPlantou = diasEntre(dataNaSafra(d.dataSoja, anoDaSafra(hoje)), hoje) >= 0;
  const fimMilho = diaEixo(d.plantioMilho) + cicloMilho > 364 ? "08-31" : somarDias(d.plantioMilho, cicloMilho);

  const sobreposto =
    ep && diaEixo(ep.inicio) < diaEixo(d.faseFim) && diaEixo(ep.fim) > diaEixo(d.faseInicio)
      ? {
          inicio: diaEixo(ep.inicio) > diaEixo(d.faseInicio) ? ep.inicio : d.faseInicio,
          fim: diaEixo(ep.fim) < diaEixo(d.faseFim) ? ep.fim : d.faseFim,
        }
      : null;
  const geadaClara = ep ? somarDias(ep.inicio, Math.round((diaEixo(ep.fim) - diaEixo(ep.inicio)) * 0.25)) : null;

  const notas: Nota[] = [
    {
      id: "soja",
      y: y(d.dataSoja),
      alto: 38,
      no: <Cartao titulo={jaPlantou ? t("Plantou a soja", "Soybeans planted") : t("Plantar a soja", "Plant soybeans")} sub={dia(d.dataSoja)} ponto="#7CC46A" />,
    },
    {
      id: "hoje",
      y: y(hj),
      alto: 34,
      no: (
        <div className="flex h-[34px] items-center gap-1.5 rounded-xl bg-texto px-2.5 text-sm font-extrabold text-white">
          {t("Hoje", "Today")}
          <span className="font-semibold text-broto">· {dia(hj)}</span>
        </div>
      ),
    },
    {
      id: "colheita",
      y: (y(d.colheitaSoja) + y(d.plantioMilho)) / 2,
      alto: 38,
      no: (
        <Cartao
          titulo={t("Colher e plantar milho", "Harvest and plant corn")}
          sub={t(`${dia(d.colheitaSoja)} a ${dia(d.plantioMilho)}`, `${dia(d.colheitaSoja)} to ${dia(d.plantioMilho)}`)}
          ponto="#F2C94C"
        />
      ),
    },
    {
      id: "flor",
      y: y(d.faseInicio),
      alto: 38,
      no: <Cartao titulo={t("Flor do milho", "Corn flowering")} sub={t(`a partir de ${dia(d.faseInicio)}`, `from ${dia(d.faseInicio)}`)} ponto="#E07A3E" cor="#9A3D0B" />,
    },
    ...(sobreposto
      ? [
          {
            id: "risco",
            y: y(sobreposto.inicio),
            alto: 38,
            no: (
              <Cartao
                titulo={t("⚠ Flor + frio", "⚠ Flowers + cold")}
                sub={t(`a partir de ${dia(sobreposto.inicio)}`, `from ${dia(sobreposto.inicio)}`)}
                ponto="#B4480E"
                cor="#9A3D0B"
                fundo="#FFF1E8"
              />
            ),
          },
        ]
      : []),
    ...(ep
      ? [
          {
            id: "geada",
            y: (y(geadaClara!) + y(ep.fim)) / 2,
            alto: 38,
            no: (
              <Cartao
                titulo={t("Época de geada", "Frost season")}
                sub={t(`${dia(ep.inicio)} a ${dia(ep.fim)}`, `${dia(ep.inicio)} to ${dia(ep.fim)}`)}
                ponto="#3E6EA8"
                cor="#2F5A92"
              />
            ),
          },
        ]
      : []),
  ].sort((a, b) => a.y - b.y);

  // empilha sem sobrepor
  const posicoes = notas.reduce<(Nota & { topo: number })[]>((acc, n) => {
    const ant = acc[acc.length - 1];
    const topo = Math.max(n.y - n.alto / 2, ant ? ant.topo + ant.alto + 4 : 34);
    return [...acc, { ...n, topo }];
  }, []);
  const ultima = posicoes[posicoes.length - 1];
  const excesso = Math.max(0, (ultima ? ultima.topo + ultima.alto : 0) - ALTURA + 4);
  const mesHoje = hoje.getMonth();

  const barra = (de: string, ate: string, x: number, cor: string, raio = "13px") => (
    <div className="absolute w-[26px]" style={{ left: x, top: y(de), height: Math.max(y(ate) - y(de), 4), background: cor, borderRadius: raio }} />
  );

  return (
    <div
      role="img"
      aria-label={t(
        `Calendário: soja de ${dia(d.dataSoja)} a ${dia(d.colheitaSoja)}, milho a partir de ${dia(d.plantioMilho)}, flor do milho de ${dia(d.faseInicio)} a ${dia(d.faseFim)}${ep ? `, época de geada de ${dia(ep.inicio)} a ${dia(ep.fim)}` : ""}`,
        `Calendar: soybeans ${dia(d.dataSoja)} to ${dia(d.colheitaSoja)}, corn from ${dia(d.plantioMilho)}, corn flowering ${dia(d.faseInicio)} to ${dia(d.faseFim)}${ep ? `, frost season ${dia(ep.inicio)} to ${dia(ep.fim)}` : ""}`,
      )}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: ALTURA + excesso }}
    >
      {MESES_EIXO.map((m, i) => (
        <div key={m}>
          <div className="absolute left-0 right-0" style={{ top: TOPO + i * LINHA, height: LINHA, background: i % 2 ? "#FFFFFF" : "#FBF9F4" }} />
          <span
            className={`absolute left-0 flex w-10 items-center justify-center text-[15px] ${m === mesHoje ? "font-black text-texto" : "font-bold text-texto-2"}`}
            style={{ top: TOPO + i * LINHA, height: LINHA }}
          >
            {mesAbrev(m, lang)}
          </span>
        </div>
      ))}
      {sobreposto && (
        <div className="absolute left-10 right-0 bg-[#FBD5BF]" style={{ top: y(sobreposto.inicio), height: y(sobreposto.fim) - y(sobreposto.inicio) }} />
      )}
      {barra(d.dataSoja, d.colheitaSoja, 46, "#7CC46A")}
      {barra(d.plantioMilho, fimMilho, 78, "#F2C94C")}
      {barra(d.faseInicio, d.faseFim, 78, "#E07A3E")}
      {ep && barra(ep.inicio, geadaClara!, 110, "#A9C9EE", "13px 13px 0 0")}
      {ep && barra(geadaClara!, ep.fim, 110, "#3E6EA8", "0 0 13px 13px")}
      <div className="absolute left-10 right-0 border-t-[2.5px] border-dashed border-texto" style={{ top: y(hj) }} />
      <span className="absolute left-9 size-2.5 rounded-full bg-texto shadow-[0_0_0_3px_#9BE36B]" style={{ top: y(hj) - 5 }} />
      <span className="absolute left-[46px] top-1 flex h-[30px] w-[26px] items-center justify-center">
        <IcSoja size={24} />
      </span>
      <span className="absolute left-[78px] top-1 flex h-[30px] w-[26px] items-center justify-center">
        <IcMilho size={24} linhas={false} />
      </span>
      <span className="absolute left-[110px] top-1 flex h-[30px] w-[26px] items-center justify-center">
        <IcGeada size={22} ponta={false} traco={2.4} />
      </span>
      <span className="absolute left-[150px] top-2.5 text-[13px] font-bold text-texto-2">{t("O que acontece", "What happens")}</span>
      {posicoes.map((n) => (
        <div key={n.id} className="absolute left-[146px] right-1" style={{ top: n.topo }}>
          {n.no}
        </div>
      ))}
    </div>
  );
}

type Dia = { data: string; codigo: number; tmax: number | null; chuva: number | null; vento: number | null };

function EstaSemana({ lat, lon }: { lat: number; lon: number }) {
  const t = useT();
  const lang = useLang();
  const [estado, setEstado] = useState<{ tipo: "carregando" } | { tipo: "erro" } | { tipo: "ok"; dias: Dia[] }>({ tipo: "carregando" });
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=weather_code,temperature_2m_max,precipitation_sum,wind_speed_10m_max&forecast_days=7&timezone=America%2FSao_Paulo`,
      { signal: ctrl.signal },
    )
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        const dd = j?.daily;
        if (!dd?.time) throw new Error("resposta inesperada");
        setEstado({
          tipo: "ok",
          dias: (dd.time as string[]).map((data, i) => ({
            data,
            codigo: dd.weather_code?.[i] ?? 0,
            tmax: dd.temperature_2m_max?.[i] ?? null,
            chuva: dd.precipitation_sum?.[i] ?? null,
            vento: dd.wind_speed_10m_max?.[i] ?? null,
          })),
        });
      })
      .catch((e: unknown) => {
        if ((e as Error)?.name !== "AbortError") setEstado({ tipo: "erro" });
      });
    return () => ctrl.abort();
  }, [lat, lon]);

  const SEMANA = lang === "en" ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const nota = (x: Dia): { cor: string; pt: string; en: string } => {
    const chuva = x.chuva ?? 0;
    const vento = x.vento ?? 0;
    if (chuva >= 5 || vento >= 25) return { cor: "#E07A3E", pt: "evite", en: "avoid" };
    if (chuva >= 1 || vento >= 15) return { cor: "#F2C46A", pt: "atenção", en: "caution" };
    return { cor: "#7CC46A", pt: "bom", en: "good" };
  };
  const icone = (x: Dia): "sol" | "nuvem" | "chuva" =>
    x.codigo >= 51 || (x.chuva ?? 0) >= 1 ? "chuva" : x.codigo >= 2 ? "nuvem" : "sol";

  return (
    <section
      className="wh-in flex flex-col gap-3 rounded-3xl bg-[linear-gradient(180deg,#E4EEFA,#F4F8FD)] p-[18px]"
      style={{ animationDelay: ".2s" }}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-black tracking-normal">{t("Esta semana na lavoura", "This week in the field")}</h2>
        <span className="text-sm text-[#33507A]">
          {t("Bom dia para pulverizar = sem chuva e pouco vento", "Good spraying day = no rain and little wind")}
        </span>
      </div>
      {estado.tipo === "erro" && (
        <p className="m-0 rounded-2xl bg-white p-3 text-sm text-texto-2">
          {t("Não foi possível carregar a previsão agora. Tente de novo mais tarde.", "The forecast could not be loaded right now. Please try again later.")}
        </p>
      )}
      {estado.tipo !== "erro" && (
        <ul className="m-0 grid list-none grid-cols-7 gap-[5px] p-0" aria-busy={estado.tipo === "carregando"}>
          {(estado.tipo === "ok" ? estado.dias : Array.from({ length: 7 }, () => null)).map((x, i) => {
            if (!x) return <li key={i} className="h-[104px] animate-pulse rounded-[18px] bg-white/70" />;
            const n = nota(x);
            const hoje = i === 0;
            const wd = new Date(`${x.data}T12:00:00`).getDay();
            return (
              <li
                key={x.data}
                className={`flex flex-col items-center gap-1.5 rounded-[18px] py-2.5 ${hoje ? "bg-texto text-white" : "bg-white"}`}
                aria-label={`${SEMANA[wd]}: ${x.tmax === null ? "–" : Math.round(x.tmax)}°, ${t(n.pt, n.en)}`}
              >
                <span className={`text-[13px] font-bold ${hoje ? "text-broto" : "text-texto-2"}`}>{SEMANA[wd]}</span>
                <IcTempo tipo={icone(x)} />
                <span className="text-[13px] font-extrabold">{x.tmax === null ? "–" : `${Math.round(x.tmax)}°`}</span>
                <span className="size-2 rounded-full" style={{ background: n.cor }} />
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex gap-3.5 text-sm font-bold text-[#33507A]">
        {[
          ["#7CC46A", t("bom", "good")],
          ["#F2C46A", t("atenção", "caution")],
          ["#E07A3E", t("evite", "avoid")],
        ].map(([c, r]) => (
          <span key={r} className="flex items-center gap-[5px]">
            <span className="size-2 rounded-full" style={{ background: c }} />
            {r}
          </span>
        ))}
      </div>
      <span className="text-xs text-[#33507A]">
        {t("Previsão:", "Forecast:")}{" "}
        <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>{" "}
        (CC BY 4.0)
      </span>
    </section>
  );
}

export function TelaCalendario({
  local,
  d,
  baixada,
  cicloMilho,
  hoje,
  onAgenda,
  onVoltar,
}: {
  local: LocalView;
  d: DataView;
  baixada: boolean;
  cicloMilho: number;
  hoje: Date;
  onAgenda: () => void;
  onVoltar?: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const ano = anoDaSafra(hoje);
  const ep = local.epocaGeada;
  const sobrepoe = ep && diaEixo(ep.inicio) < diaEixo(d.faseFim) && diaEixo(ep.fim) > diaEixo(d.faseInicio);
  const em = (mmdd: string) => diasEntre(hoje, dataNaSafra(mmdd, ano));
  const geada = baixada ? d.geadaBaixada : d.geada;

  const itens: { id: LembreteId; icone: React.ReactNode; fundo: string; titulo: string; sub: string; subCor?: string; quando: string; ate?: string }[] = [
    { id: "soja", icone: <IcSoja size={24} />, fundo: "#E3F2E1", titulo: t("Plantar a soja", "Plant soybeans"), sub: dia(d.dataSoja), quando: d.dataSoja },
    {
      id: "colheita",
      icone: <IcColheita size={24} />,
      fundo: "#FBEFD2",
      titulo: t("Colher a soja", "Harvest soybeans"),
      sub: t(`perto de ${dia(d.colheitaSoja)}`, `around ${dia(d.colheitaSoja)}`),
      quando: d.colheitaSoja,
    },
    {
      id: "milho",
      icone: <IcMilho size={24} />,
      fundo: "#FBEFD2",
      titulo: t("Plantar o milho", "Plant the corn"),
      sub: t(`até ${dia(d.plantioMilho)} · logo após a colheita`, `by ${dia(d.plantioMilho)} · right after harvest`),
      quando: d.plantioMilho,
    },
    {
      id: "flor",
      icone: <IcFlor size={24} />,
      fundo: "#FDE3D3",
      titulo: t("Flor do milho", "Corn flowering"),
      sub: t(`${dia(d.faseInicio)} a ${dia(d.faseFim)} · fase sensível`, `${dia(d.faseInicio)} to ${dia(d.faseFim)} · sensitive stage`),
      subCor: "#9A3D0B",
      quando: d.faseInicio,
      ate: d.faseFim,
    },
  ];
  const feitos = itens.filter((x) => em(x.quando) < 0).length;

  return (
    <>
      <CabecalhoInterno
        etiqueta={t(`SAFRA ${ano}/${String(ano + 1).slice(2)}`, `SEASON ${ano}/${String(ano + 1).slice(2)}`)}
        titulo={t("Seu ano na lavoura", "Your year in the field")}
        subtitulo={t(`${local.nome} · soja ${dia(d.dataSoja)} → milho safrinha`, `${local.nome} · soybeans ${dia(d.dataSoja)} → second-crop corn`)}
        onVoltar={onVoltar}
      />
      <main className="-mt-6 flex flex-col gap-3.5 px-4 pb-10">
        <section className="wh-in flex flex-col gap-3.5 rounded-[28px] bg-white p-4 shadow-[0_6px_20px_rgba(20,35,26,.07)]">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-xl font-black tracking-normal">{t("Mês a mês", "Month by month")}</h2>
            <span className="text-sm text-texto-2">{t("Leia de cima para baixo, como uma agenda", "Read top to bottom, like a planner")}</span>
          </div>
          <MesAMes d={d} local={local} cicloMilho={cicloMilho} hoje={hoje} />
          <div className="flex items-center gap-2.5 rounded-2xl bg-[#FDF0E7] px-3.5 py-3">
            <IcExclamacao />
            <span className="text-[15px] leading-[1.4] text-[#6B2C08]">
              {sobrepoe ? (
                <>
                  {t("A faixa ", "The ")}
                  <strong>{t("laranja", "orange")}</strong>
                  {t(
                    " é quando a flor do milho e o frio se encontram. É aí que mora o risco.",
                    " band is when the corn flowers and the cold meet. That is where the risk lies.",
                  )}
                </>
              ) : geada.anosComEvento > 0 ? (
                <>
                  {t(
                    "A flor do milho termina antes do pico do frio, mas geadas mais cedo davam um risco de ",
                    "Corn flowering ends before the peak of the cold, but earlier frosts gave a risk of ",
                  )}
                  <strong>{fraseDez(geada, lang)}</strong>.
                </>
              ) : (
                t(
                  "Com esta data, a flor do milho fica fora da época de geada.",
                  "With this date, corn flowering stays outside the frost season.",
                )
              )}
            </span>
          </div>
        </section>

        <section className="wh-in flex flex-col gap-1.5 rounded-3xl bg-white p-[18px] shadow-[0_6px_20px_rgba(20,35,26,.05)]" style={{ animationDelay: ".1s" }}>
          <div className="mb-1.5 flex items-center justify-between">
            <h2 className="m-0 text-lg font-black tracking-normal">{t("Lembretes", "Reminders")}</h2>
            <span className="text-sm text-texto-2">{t(`${feitos} de 5 feito${feitos === 1 ? "" : "s"}`, `${feitos} of 5 done`)}</span>
          </div>
          <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-[#EEE8DB]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#7CC46A,#2E7D4A)]" style={{ width: `${(feitos / 5) * 100}%` }} />
          </div>
          <ul className="m-0 flex list-none flex-col p-0">
            {itens.map((x) => {
              const dias = em(x.quando);
              const feito = dias < 0;
              return (
                <li key={x.id} className="flex min-h-16 items-center gap-3 border-b border-divisor">
                  <span
                    className="flex size-11 flex-none items-center justify-center rounded-full"
                    style={{ background: feito ? "#2E7D4A" : x.fundo }}
                  >
                    {feito ? <IcCheck /> : x.icone}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className={`text-[15px] font-extrabold ${feito ? "text-texto-2 line-through" : ""}`}>{x.titulo}</span>
                    <span className="text-sm" style={{ color: x.subCor ?? "#4A5A50" }}>
                      {feito
                        ? `${dia(x.quando)} · ${t("feito", "done")}`
                        : x.id === "colheita"
                          ? `${x.sub} · ${t(`em ${dias} dias`, `in ${dias} days`)}`
                          : x.sub}
                    </span>
                  </span>
                  {!feito && (
                    <a
                      href={linkGoogleAgenda({
                        titulo: x.titulo,
                        inicio: dataNaSafra(x.quando, ano),
                        fim: x.ate ? dataNaSafra(x.ate, ano) : undefined,
                        descricao: t(
                          `${local.nome} · soja em ${dia(d.dataSoja)}. Planejado com o weharvest (dados NASA POWER). Confirme com seu agrônomo.`,
                          `${local.nome} · soybeans on ${dia(d.dataSoja)}. Planned with weharvest (NASA POWER data). Confirm with your agronomist.`,
                        ),
                      })}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t(`Adicionar à agenda: ${x.titulo}`, `Add to calendar: ${x.titulo}`)}
                      className="flex min-h-11 flex-none items-center gap-1 rounded-full bg-[#E3F2E1] px-3 text-sm font-extrabold text-lavoura-escura no-underline"
                    >
                      + {t("Agenda", "Calendar")}
                    </a>
                  )}
                </li>
              );
            })}
            <li className="flex min-h-16 items-center gap-3">
              <span className="flex size-11 flex-none items-center justify-center rounded-full bg-[#DCE8F6]">
                <IcGeada size={22} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-extrabold">{t("Aviso de geada", "Frost warning")}</span>
                <span className="text-sm text-[#2F5A92]">{t("mensagem no WhatsApp 3 dias antes", "WhatsApp message 3 days ahead")}</span>
              </span>
              <span className="flex-none rounded-full bg-[#DCE8F6] px-3 py-1.5 text-[13px] font-bold text-[#2F5A92]">{t("Em breve", "Coming soon")}</span>
            </li>
          </ul>
          <p className="m-0 mt-2 text-[13px] leading-[1.45] text-texto-2">
            {t(
              "“+ Agenda” abre o Google Agenda com o lembrete pronto para salvar.",
              "“+ Calendar” opens Google Calendar with the reminder ready to save.",
            )}
          </p>
          <button
            type="button"
            onClick={onAgenda}
            className="min-h-12 cursor-pointer rounded-full border-[1.5px] border-[#D6CFBE] bg-white text-[15px] font-extrabold text-texto"
          >
            {t("Baixar todos (iPhone e outras agendas)", "Download all (iPhone and other calendars)")}
          </button>
        </section>

        <EstaSemana key={local.id} lat={local.lat} lon={local.lon} />
      </main>
    </>
  );
}
