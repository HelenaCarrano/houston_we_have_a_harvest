"use client";

import { useEffect, useRef } from "react";
import { Broto, CeuAnimado, IcAgenda, IcMenu, IcVoltar, IcWhatsApp, Logo } from "@/components/wh/Arte";
import { useT } from "@/lib/i18n";

const BTN_REDONDO =
  "flex size-11 items-center justify-center rounded-full border border-ceu-line bg-transparent cursor-pointer";

/** Cabeçalho escuro da tela inicial: logo, menu, saudação e o Broto. */
export function CabecalhoInicio({
  saudacao,
  titulo,
  onMenu,
  ceu = true,
}: {
  saudacao: string;
  titulo: string;
  onMenu: () => void;
  ceu?: boolean;
}) {
  const t = useT();
  return (
    <header className={`relative overflow-hidden bg-ceu px-5 pt-5 ${ceu ? "pb-[34px]" : "pb-10"}`}>
      {ceu && <CeuAnimado />}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={38} />
          <span className="text-[21px] font-black tracking-[-0.03em] text-claro">weharvest</span>
        </div>
        <button type="button" aria-label={t("Menu", "Menu")} onClick={onMenu} className={BTN_REDONDO}>
          <IcMenu />
        </button>
      </div>
      <div className={`relative flex items-end justify-between ${ceu ? "mt-[18px]" : "mt-4"}`}>
        <div className="flex flex-col gap-1">
          <span className={`${ceu ? "text-sm" : "text-[15px]"} font-bold text-broto`}>{saudacao}</span>
          <h1 className={`m-0 ${ceu ? "max-w-[250px]" : "max-w-[260px]"} text-[23px] font-black leading-[1.1] tracking-normal text-claro`}>
            {titulo}
          </h1>
        </div>
        <Broto size={ceu ? 64 : 62} />
      </div>
    </header>
  );
}

/** Cabeçalho escuro das telas internas: voltar, etiqueta opcional, título e subtítulo. */
export function CabecalhoInterno({
  titulo,
  subtitulo,
  etiqueta,
  onVoltar,
}: {
  titulo: string;
  subtitulo: string;
  etiqueta?: string;
  onVoltar: () => void;
}) {
  const t = useT();
  return (
    <header className="flex flex-col gap-3.5 bg-ceu px-5 pb-10 pt-5">
      <div className="flex items-center justify-between">
        <button type="button" aria-label={t("Voltar", "Back")} onClick={onVoltar} className={BTN_REDONDO}>
          <IcVoltar />
        </button>
        {etiqueta && <span className="font-mono text-xs tracking-[0.14em] text-broto">{etiqueta}</span>}
        <span className="w-11" />
      </div>
      <h1 className="m-0 text-[27px] font-black leading-[1.1] tracking-[-0.02em] text-claro">{titulo}</h1>
      <p className={`m-0 ${etiqueta ? "text-sm" : "text-[15px]"} text-claro-2`}>{subtitulo}</p>
    </header>
  );
}

/** Barra fixa no rodapé: WhatsApp e Agenda. */
export function BarraAcoes({ hrefWhatsApp, onAgenda }: { hrefWhatsApp: string; onAgenda: () => void }) {
  const t = useT();
  return (
    <div className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-[440px] -translate-x-1/2 grid-cols-[1fr_auto] gap-2.5 border-t border-borda bg-white/95 px-4 pb-[22px] pt-3 backdrop-blur">
      <a
        href={hrefWhatsApp}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-whatsapp text-base font-extrabold text-white shadow-[0_6px_16px_rgba(37,165,95,.35)]"
      >
        <IcWhatsApp />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={onAgenda}
        className="flex min-h-14 cursor-pointer items-center gap-2 rounded-full bg-campo px-4 text-[15px] font-extrabold text-texto"
      >
        <IcAgenda />
        {t("Agenda", "Calendar")}
      </button>
    </div>
  );
}

/** Folha que sobe do rodapé (menu, município, data). Fecha com Esc ou tocando fora. */
export function Folha({ titulo, onFechar, children }: { titulo: string; onFechar: () => void; children: React.ReactNode }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, a, input")?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
      anterior?.focus();
    };
  }, [onFechar]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ceu/50" onClick={onFechar}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="wh-sheet flex max-h-[85vh] w-full max-w-[440px] flex-col gap-3 overflow-y-auto rounded-t-[28px] bg-palha px-4 pb-8 pt-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-xl font-black">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            className="min-h-11 cursor-pointer rounded-full bg-campo px-4 text-[15px] font-bold text-texto"
          >
            {t("Fechar", "Close")}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Abas "Vou plantar" / "Já plantei". */
export function AbasModo({ modo, onModo }: { modo: "vou" | "ja"; onModo: (m: "vou" | "ja") => void }) {
  const t = useT();
  const aba = (m: "vou" | "ja", rotulo: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={modo === m}
      onClick={() => onModo(m)}
      className={`min-h-[46px] cursor-pointer rounded-full border-none text-[15px] font-extrabold ${
        modo === m ? "bg-texto text-white" : "bg-transparent text-texto"
      }`}
    >
      {rotulo}
    </button>
  );
  return (
    <div role="tablist" aria-label={t("Momento da safra", "Season stage")} className="grid grid-cols-2 gap-1 rounded-full bg-campo p-1">
      {aba("vou", t("Vou plantar", "Planning"))}
      {aba("ja", t("Já plantei", "Already planted"))}
    </div>
  );
}

/** Linha clicável dentro do cartão (município / data). */
export function LinhaEscolha({
  icone,
  rotulo,
  valor,
  acao,
  onClick,
  alto = 52,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  acao: string;
  onClick: () => void;
  alto?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border-none bg-campo px-3.5 text-left"
      style={{ minHeight: alto }}
    >
      {icone}
      <span className="flex flex-1 flex-col">
        <span className="text-[13px] text-texto-2">{rotulo}</span>
        <span className={`${alto > 52 ? "text-lg" : "text-[17px]"} font-extrabold text-texto`}>{valor}</span>
      </span>
      <span className={`${alto > 52 ? "text-[15px]" : "text-sm"} font-bold text-lavoura`}>{acao}</span>
    </button>
  );
}
