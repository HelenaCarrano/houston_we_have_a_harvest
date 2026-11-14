import { buttonVariants } from "@/components/ui/button";
import { Rocket, Sparkles, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <main className="flex flex-col items-center text-center max-w-2xl gap-8 p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 backdrop-blur shadow-xl">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900 text-xs text-zinc-400">
          <Sparkles className="size-3.5 text-amber-400" />
          <span>Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Rocket className="size-10" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            NasaApp
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg">
            Projeto inicializado com sucesso com as tecnologias mais recentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "default" })}
          >
            Componentes shadcn <ExternalLink className="size-4 ml-1.5" />
          </a>

          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Docs Next.js <ExternalLink className="size-4 ml-1.5" />
          </a>
        </div>

        <div className="w-full pt-4 border-t border-zinc-800/80 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Node.js via .nvmrc: v24.13.0</span>
          <span>Edite src/app/page.tsx para começar</span>
        </div>
      </main>
    </div>
  );
}
