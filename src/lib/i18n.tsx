"use client";

// Idioma da interface: inglês (padrão, exigido pelo NASA Space Apps) e português (usuários reais).
import { createContext, useContext } from "react";

export type Lang = "en" | "pt";

export const LangContext = createContext<Lang>("en");

export const useLang = (): Lang => useContext(LangContext);

/** t(português, inglês) */
export function useT() {
  const lang = useLang();
  return (pt: string, en: string) => (lang === "en" ? en : pt);
}

const MESES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "MM-DD" → "20/10" (pt) ou "Oct 20" (en). */
export function fmtDia(mmdd: string, lang: Lang): string {
  const m = Number(mmdd.slice(0, 2));
  const d = Number(mmdd.slice(3, 5));
  return lang === "en" ? `${MESES_EN[m - 1]} ${d}` : `${mmdd.slice(3, 5)}/${mmdd.slice(0, 2)}`;
}

/** "YYYY-MM-DD" → "20/10/2026" (pt) ou "Oct 20, 2026" (en). */
export function fmtData(iso: string, lang: Lang): string {
  const y = iso.slice(0, 4);
  return lang === "en" ? `${fmtDia(iso.slice(5, 10), "en")}, ${y}` : `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${y}`;
}

export function fmtNum(x: number, casas: number, lang: Lang): string {
  return x.toLocaleString(lang === "en" ? "en-US" : "pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

export const NIVEL_EN: Record<string, string> = {
  Baixo: "Low",
  Médio: "Medium",
  Alto: "High",
  "Não calculado": "Not calculated",
};

export const CONFIANCA_EN: Record<string, string> = { alta: "high", média: "medium", baixa: "low" };

export const MESES_EIXO: Record<Lang, string[]> = {
  pt: ["set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago"],
  en: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
};
