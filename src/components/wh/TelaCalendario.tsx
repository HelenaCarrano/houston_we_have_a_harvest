"use client";

import type { DataView, LocalView } from "@/lib/view-data";
import {
  IcCheck,
  IcColheita,
  IcExclamacao,
  IcFlor,
  IcMilho,
  IcSoja,
} from "@/components/wh/Arte";
import { CabecalhoInterno } from "@/components/wh/Moldura";
import { CalendarioMes } from "@/components/wh/CalendarioMes";
import { eventosDaSafra } from "@/components/wh/safra";
import { anoDaSafra, dataNaSafra, diaEixo, diasEntre, fraseDez, linkGoogleAgenda } from "@/components/wh/modelo";
import { fmtDia, useLang, useT } from "@/lib/i18n";

export type LembreteId = "soja" | "colheita" | "milho" | "flor";

export function TelaCalendario({
  local,
  d,
  baixada,
  cicloMilho,
  hoje,
  onAgenda,
  onVoltar,
  onMenu,
}: {
  local: LocalView;
  d: DataView;
  baixada: boolean;
  cicloMilho: number;
  hoje: Date;
  onAgenda: () => void;
  onVoltar?: () => void;
  onMenu?: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const dia = (x: string) => fmtDia(x, lang);
  const ano = anoDaSafra(hoje);
  const eventos = eventosDaSafra({ d, local, cicloMilho, hoje, t, lang });
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
        onMenu={onMenu}
      />
      <main className="-mt-6 flex flex-col gap-3.5 px-4 pb-10">
        <section className="wh-in flex flex-col gap-3.5 rounded-[28px] bg-white p-4 shadow-[0_6px_20px_rgba(20,35,26,.07)]">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-xl font-black tracking-normal">{t("Calendário da safra", "Season calendar")}</h2>
            <span className="text-sm text-texto-2">{t("Toque em um dia para ver o que acontece nele", "Tap a day to see what happens on it")}</span>
          </div>
          <CalendarioMes eventos={eventos} hoje={hoje} ano={ano} />
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
            <span className="text-sm text-texto-2">{t(`${feitos} de ${itens.length} feito${feitos === 1 ? "" : "s"}`, `${feitos} of ${itens.length} done`)}</span>
          </div>
          <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-[#EEE8DB]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#7CC46A,#2E7D4A)]" style={{ width: `${(feitos / itens.length) * 100}%` }} />
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
          </ul>
          <button
            type="button"
            onClick={onAgenda}
            className="min-h-12 cursor-pointer rounded-full border-[1.5px] border-[#D6CFBE] bg-white text-[15px] font-extrabold text-texto"
          >
            {t("Salvar todos na agenda do celular", "Save all to your phone calendar")}
          </button>
        </section>

      </main>
    </>
  );
}
