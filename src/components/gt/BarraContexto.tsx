"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n";

/** Resumo da escolha, só no celular, quando o painel "Sua lavoura" saiu da tela. */
export function BarraContexto({
  nome,
  data,
  baixada,
  filtro,
}: {
  nome: string;
  data: string;
  baixada: boolean;
  filtro: string;
}) {
  const t = useT();
  const [painelVisivel, setPainelVisivel] = useState(true);

  useEffect(() => {
    const el = document.getElementById("sua-lavoura");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setPainelVisivel(e.isIntersecting), { rootMargin: "-56px 0px 0px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (painelVisivel) return null;
  return (
    <nav
      aria-label={t("Resumo da escolha", "Current selection")}
      className="fixed inset-x-0 top-14 z-20 flex h-12 items-center justify-between gap-2 border-b border-line bg-surface/95 px-4 text-sm backdrop-blur lg:hidden"
    >
      <p className="flex min-w-0 flex-wrap items-center gap-x-3 truncate">
        <span className="inline-flex items-center gap-1 font-semibold">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {nome}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          {data}
        </span>
        {baixada && <span>{t("baixada", "lowland")}</span>}
        {filtro && <span className="max-sm:hidden">{filtro}</span>}
      </p>
      <Button
        variant="ghost"
        className="shrink-0 !px-2"
        onClick={() => document.getElementById("sua-lavoura")?.scrollIntoView({ behavior: "smooth", block: "start" })}
      >
        {t("Alterar", "Change")}
      </Button>
    </nav>
  );
}
