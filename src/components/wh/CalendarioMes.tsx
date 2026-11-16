"use client";

import { useState } from "react";
import { COR_EVENTO, eventosDoDia, mesmoDia, type EventoSafra } from "@/components/wh/safra";
import { useLang, useT } from "@/lib/i18n";

const maiuscula = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/** Calendário do app: um mês por vez, de setembro a agosto da safra, com os eventos do produtor marcados. */
export function CalendarioMes({ eventos, hoje, ano }: { eventos: EventoSafra[]; hoje: Date; ano: number }) {
  const t = useT();
  const lang = useLang();
  // índice do mês na safra: 0 = setembro … 11 = agosto
  const mesDeHoje = (hoje.getMonth() + 4) % 12;
  const [mes, setMes] = useState(mesDeHoje);
  const [sel, setSel] = useState<Date>(hoje);

  const primeiro = new Date(mes < 4 ? ano : ano + 1, (mes + 8) % 12, 1);
  const dias = new Date(primeiro.getFullYear(), primeiro.getMonth() + 1, 0).getDate();
  const vazios = primeiro.getDay();
  const intl = lang === "en" ? "en-US" : "pt-BR";
  const nomeMes = maiuscula(new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(primeiro));
  const semana = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(intl, { weekday: "narrow" }).format(new Date(2025, 8, 7 + i)));
  const doDia = eventosDoDia(eventos, sel);
  const proximo = [...eventos].sort((a, b) => a.inicio.getTime() - b.inicio.getTime()).find((e) => (e.fim ?? e.inicio).getTime() >= sel.getTime() && !mesmoDia(e.inicio, sel));
  const curto = (x: Date) => new Intl.DateTimeFormat(intl, { day: "2-digit", month: "2-digit" }).format(x);
  const irPara = (x: Date) => {
    setSel(x);
    setMes((x.getMonth() + 4) % 12);
  };
  const longo = maiuscula(new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long" }).format(sel));

  const seta = "flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-campo text-lg font-black text-texto disabled:opacity-30";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button type="button" className={seta} disabled={mes === 0} onClick={() => setMes(mes - 1)} aria-label={t("Mês anterior", "Previous month")}>
          ‹
        </button>
        <div className="flex flex-col items-center">
          <h3 className="m-0 text-lg font-black tracking-normal" aria-live="polite">
            {nomeMes}
          </h3>
          {mes !== mesDeHoje && (
            <button
              type="button"
              onClick={() => {
                setMes(mesDeHoje);
                setSel(hoje);
              }}
              className="cursor-pointer border-none bg-transparent text-sm font-extrabold text-lavoura-escura underline"
            >
              {t("Voltar para hoje", "Back to today")}
            </button>
          )}
        </div>
        <button type="button" className={seta} disabled={mes === 11} onClick={() => setMes(mes + 1)} aria-label={t("Próximo mês", "Next month")}>
          ›
        </button>
      </div>

      <div role="grid" aria-label={nomeMes} className="grid grid-cols-7 gap-1">
        {semana.map((s, i) => (
          <span key={i} role="columnheader" className="text-center text-[13px] font-bold text-texto-2">
            {s}
          </span>
        ))}
        {Array.from({ length: vazios }, (_, i) => (
          <span key={`v${i}`} />
        ))}
        {Array.from({ length: dias }, (_, i) => {
          const data = new Date(primeiro.getFullYear(), primeiro.getMonth(), i + 1);
          const ev = eventosDoDia(eventos, data);
          const ehHoje = mesmoDia(data, hoje);
          const ativo = mesmoDia(data, sel);
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              aria-selected={ativo}
              aria-label={`${new Intl.DateTimeFormat(intl, { day: "numeric", month: "long" }).format(data)}${ev.length ? ": " + ev.map((e) => e.titulo).join(", ") : ""}`}
              onClick={() => setSel(data)}
              className={`flex min-h-[46px] cursor-pointer flex-col items-center justify-center gap-[3px] rounded-xl border-2 text-[15px] font-bold ${
                ativo ? "border-texto bg-white" : "border-transparent bg-campo"
              } ${ehHoje ? "text-white !bg-texto" : "text-texto"}`}
            >
              {i + 1}
              <span className="flex h-1.5 gap-[2px]">
                {ev.slice(0, 4).map((e) => (
                  <span key={e.tipo} className="size-1.5 rounded-full" style={{ background: e.cor }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] font-bold text-texto-2">
        {(["soja", "colheita", "milho", "flor", "geada"] as const).map((k) => {
          const e = eventos.find((x) => x.tipo === k);
          return e ? (
            <span key={k} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: COR_EVENTO[k] }} />
              {e.titulo}
            </span>
          ) : null;
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-campo p-3.5" aria-live="polite">
        <span className="text-[15px] font-extrabold">
          {mesmoDia(sel, hoje) ? t("Hoje · ", "Today · ") : ""}
          {longo}
        </span>
        {doDia.length === 0 ? (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-texto-2">
            {t("Nada marcado neste dia.", "Nothing scheduled on this day.")}
            {proximo && (
              <button
                type="button"
                onClick={() => irPara(proximo.inicio)}
                className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-left text-sm font-extrabold text-lavoura-escura underline"
              >
                {t(`Próximo: ${proximo.titulo} (${curto(proximo.inicio)})`, `Next: ${proximo.titulo} (${curto(proximo.inicio)})`)}
              </button>
            )}
          </span>
        ) : (
          doDia.map((e) => (
            <span key={e.tipo} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 size-2.5 flex-none rounded-full" style={{ background: e.cor }} />
              <span>
                <strong>{e.titulo}</strong>
                <br />
                <span className="text-texto-2">{e.detalhe}</span>
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
