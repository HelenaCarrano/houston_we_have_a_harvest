"use client";

import { Sprout } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { useT, type Lang } from "@/lib/i18n";

export function TopBar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = useT();
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sprout className="size-6 text-brand" aria-hidden="true" />
          <span className="text-lg font-extrabold">weharvest</span>
          <span className="ml-2 hidden text-sm text-ink-muted sm:inline">
            {t("Dados diários da NASA desde 1981", "NASA daily data since 1981")}
          </span>
        </div>
        <Segmented<Lang>
          label={t("Idioma", "Language")}
          value={lang}
          onChange={setLang}
          className="w-28 !rounded-full"
          options={[
            { id: "en", label: "EN", lang: "en" },
            { id: "pt", label: "PT", lang: "pt" },
          ]}
        />
      </div>
    </header>
  );
}
