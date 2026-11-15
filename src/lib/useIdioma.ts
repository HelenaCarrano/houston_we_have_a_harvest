"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n";

/** Lê a preferência de idioma do navegador (só no cliente): "pt", "en", "sugerir-pt" (navegador em português, sem escolha) ou "nenhuma". */
function lerPreferenciaDeIdioma(): "pt" | "en" | "sugerir-pt" | "nenhuma" {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "pt" || q === "en") return q;
    const guardado = localStorage.getItem("weharvest-lang");
    if (guardado === "pt" || guardado === "en") return guardado;
  } catch {
    /* ignora: sem acesso ao armazenamento */
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "sugerir-pt" : "nenhuma";
}

/** Idioma: escolha na tela > ?lang=pt|en > escolha anterior > inglês. Em navegador português sem escolha, o inglês continua e oferecemos o português. */
export function useIdioma(): { lang: Lang; setLang: (l: Lang) => void; sugerirPt: boolean } {
  const preferencia = useSyncExternalStore(() => () => {}, lerPreferenciaDeIdioma, () => "nenhuma");
  const [escolhido, setEscolhido] = useState<Lang | null>(null);
  const lang: Lang = escolhido ?? (preferencia === "pt" ? "pt" : "en");
  const sugerirPt = escolhido === null && preferencia === "sugerir-pt";
  const setLang = (l: Lang) => {
    setEscolhido(l);
    try {
      localStorage.setItem("weharvest-lang", l);
    } catch {
      /* sem armazenamento: a escolha vale só nesta visita */
    }
  };
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  }, [lang]);
  return { lang, setLang, sugerirPt };
}
