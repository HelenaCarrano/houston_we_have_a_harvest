// Eventos da safra do produtor: a mesma lista alimenta o calendário, o relatório e a agenda (.ics).
// Só lê datas já calculadas pelo motor (DataView/LocalView); não calcula risco.
import type { DataView, LocalView } from "@/lib/view-data";
import { anoDaSafra, dataNaSafra, diaEixo, somarDias, type EventoAgenda } from "@/components/wh/modelo";
import { fmtDia, type Lang } from "@/lib/i18n";

export type TipoEvento = "soja" | "colheita" | "milho" | "flor" | "geada";
export type Tr = (pt: string, en: string) => string;

export interface EventoSafra {
  tipo: TipoEvento;
  titulo: string;
  detalhe: string;
  inicio: Date;
  /** Último dia (inclusivo); sem fim = um dia só. */
  fim?: Date;
  cor: string;
}

export const COR_EVENTO: Record<TipoEvento, string> = {
  soja: "#5BAE4A",
  colheita: "#C9A23A",
  milho: "#E0B63A",
  flor: "#E07A3E",
  geada: "#3E6EA8",
};

export function eventosDaSafra(args: { d: DataView; local: LocalView; cicloMilho: number; hoje: Date; t: Tr; lang: Lang }): EventoSafra[] {
  const { d, local, cicloMilho, hoje, t, lang } = args;
  const ano = anoDaSafra(hoje);
  const dt = (m: string) => dataNaSafra(m, ano);
  const dia = (m: string) => fmtDia(m, lang);
  const fimMilho = diaEixo(d.plantioMilho) + cicloMilho > 364 ? "08-31" : somarDias(d.plantioMilho, cicloMilho);
  const ep = local.epocaGeada;
  const lista: EventoSafra[] = [
    { tipo: "soja", titulo: t("Plantar a soja", "Plant soybeans"), detalhe: dia(d.dataSoja), inicio: dt(d.dataSoja), cor: COR_EVENTO.soja },
    {
      tipo: "colheita",
      titulo: t("Colher a soja", "Harvest soybeans"),
      detalhe: t(`perto de ${dia(d.colheitaSoja)}`, `around ${dia(d.colheitaSoja)}`),
      inicio: dt(d.colheitaSoja),
      cor: COR_EVENTO.colheita,
    },
    {
      tipo: "milho",
      titulo: t("Plantar o milho safrinha", "Plant second-crop corn"),
      detalhe: t(`até ${dia(d.plantioMilho)}, logo após a colheita`, `by ${dia(d.plantioMilho)}, right after harvest`),
      inicio: dt(d.plantioMilho),
      fim: dt(fimMilho),
      cor: COR_EVENTO.milho,
    },
    {
      tipo: "flor",
      titulo: t("Flor do milho", "Corn flowering"),
      detalhe: t(`${dia(d.faseInicio)} a ${dia(d.faseFim)} · fase sensível a geada e seca`, `${dia(d.faseInicio)} to ${dia(d.faseFim)} · stage sensitive to frost and drought`),
      inicio: dt(d.faseInicio),
      fim: dt(d.faseFim),
      cor: COR_EVENTO.flor,
    },
  ];
  if (ep)
    lista.push({
      tipo: "geada",
      titulo: t("Época de geada", "Frost season"),
      detalhe: t(`${dia(ep.inicio)} a ${dia(ep.fim)}`, `${dia(ep.inicio)} to ${dia(ep.fim)}`),
      inicio: dt(ep.inicio),
      fim: dt(ep.fim),
      cor: COR_EVENTO.geada,
    });
  return lista;
}

const chave = (x: Date) => x.getFullYear() * 10000 + (x.getMonth() + 1) * 100 + x.getDate();

/** Eventos que acontecem em um dia (inclui os que duram vários dias). */
export function eventosDoDia(eventos: EventoSafra[], dia: Date): EventoSafra[] {
  const k = chave(dia);
  return eventos.filter((e) => chave(e.inicio) <= k && k <= chave(e.fim ?? e.inicio));
}

export const mesmoDia = (a: Date, b: Date) => chave(a) === chave(b);

export function paraAgenda(eventos: EventoSafra[], nomeLocal: string, nota: string): EventoAgenda[] {
  return eventos.map((e) => ({ titulo: e.titulo, inicio: e.inicio, fim: e.fim, descricao: `${nomeLocal} · ${e.detalhe}. ${nota}` }));
}

/** Baixa um arquivo de texto (relatório .txt ou planilha .csv). */
export function baixarTexto(conteudo: string, nome: string, tipo: string) {
  const blob = new Blob(["﻿" + conteudo], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const aspas = (s: string) => `"${s.replace(/"/g, '""')}"`;

export function montarCsv(eventos: EventoSafra[]): string {
  const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return ["evento,inicio,fim,detalhe", ...eventos.map((e) => [aspas(e.titulo), f(e.inicio), f(e.fim ?? e.inicio), aspas(e.detalhe)].join(","))].join("\r\n");
}
