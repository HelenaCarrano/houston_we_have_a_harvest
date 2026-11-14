"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-zinc-300 dark:border-zinc-800">
        <span className="sr-only">Alternar tema</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 px-3 gap-2 rounded-full border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm transition-all text-xs font-semibold"
      title="Alternar entre modo claro e escuro"
    >
      {isDark ? (
        <>
          <Sun className="size-4 text-amber-400" />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="size-4 text-blue-600" />
          <span>Modo Escuro</span>
        </>
      )}
    </Button>
  );
}
