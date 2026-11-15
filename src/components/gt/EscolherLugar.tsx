"use client";

import { useRef, useState } from "react";
import type { EngineParams } from "@/lib/engine/index.ts";
import type { IndiceEnso } from "@/lib/engine/enso.ts";
import { buildLocalView, type LocalView } from "@/lib/local-view.ts";
import { baixarPower } from "@/lib/power.ts";
import { buscarLugares, dentroDoBrasil, idDoPonto, noSulDoBrasil, type Lugar } from "@/lib/lugares.ts";
import { useT } from "@/lib/i18n";

type Aviso = { tipo: "erro" | "info"; pt: string; en: string };

/** Escolha de qualquer município do Sul do Brasil: busca pelo nome ou localização do aparelho; os dados da NASA POWER são baixados na hora. */
export function EscolherLugar({
  params,
  indiceEnso,
  onLocal,
}: {
  params: EngineParams;
  indiceEnso: IndiceEnso;
  onLocal: (l: LocalView) => void;
}) {
  const t = useT();
  const [texto, setTexto] = useState("");
  const [achados, setAchados] = useState<Lugar[] | null>(null);
  const [ocupado, setOcupado] = useState<null | "buscando" | "baixando">(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [baixandoNome, setBaixandoNome] = useState("");
  const ctrl = useRef<AbortController | null>(null);

  const comecar = () => {
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    // a NASA às vezes demora: depois de 45 s desistimos e mostramos o erro
    const sinal = ctrl.current.signal;
    setTimeout(() => ctrl.current?.signal === sinal && ctrl.current.abort(), 45_000);
    return sinal;
  };

  const calcular = async (nome: string, lat: number, lon: number) => {
    if (!dentroDoBrasil(lat, lon) || !noSulDoBrasil(lat)) {
      setAviso({
        tipo: "erro",
        pt: "Este app foi calibrado para o Sul do Brasil (ao sul de 22°S: PR, SC, RS e áreas próximas). Em outras regiões os ciclos e a regra de seca não valem, então não calculamos.",
        en: "This app was calibrated for southern Brazil (south of 22°S: PR, SC, RS and nearby areas). In other regions the crop cycles and the drought rule do not apply, so we do not compute.",
      });
      return;
    }
    const sinal = comecar();
    setOcupado("baixando");
    setBaixandoNome(nome);
    setAviso(null);
    try {
      const id = idDoPonto(lat, lon);
      const dados = await baixarPower({ id, nome, lat, lon }, { signal: sinal });
      onLocal(buildLocalView({ id, nome, lat, lon, dados, relevo: null, params, indiceEnso, personalizado: true }));
      setAchados(null);
      setTexto("");
    } catch (e) {
      setAviso({
        tipo: "erro",
        pt: `Não foi possível baixar os dados da NASA agora${(e as Error).name === "AbortError" ? " (demorou demais)" : ""}. Tente de novo em instantes ou escolha um dos 3 municípios prontos.`,
        en: `We could not download the NASA data right now${(e as Error).name === "AbortError" ? " (it took too long)" : ""}. Try again in a moment or pick one of the 3 ready-made municipalities.`,
      });
    } finally {
      setOcupado(null);
    }
  };

  const buscar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (texto.trim().length < 2) return;
    const sinal = comecar();
    setOcupado("buscando");
    setAviso(null);
    setAchados(null);
    try {
      const r = await buscarLugares(texto, { signal: sinal });
      setAchados(r);
      if (r.length === 0)
        setAviso({
          tipo: "info",
          pt: "Nenhum município encontrado com esse nome. Confira a grafia.",
          en: "No municipality found with that name. Check the spelling.",
        });
    } catch {
      setAviso({
        tipo: "erro",
        pt: "A busca de município não respondeu. Tente de novo ou use sua localização.",
        en: "The municipality search did not respond. Try again or use your location.",
      });
    } finally {
      setOcupado(null);
    }
  };

  const usarGps = () => {
    if (!navigator.geolocation) {
      setAviso({ tipo: "erro", pt: "Este aparelho não informa a localização.", en: "This device does not provide a location." });
      return;
    }
    setOcupado("buscando");
    setAviso(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = Math.round(p.coords.latitude * 10000) / 10000;
        const lon = Math.round(p.coords.longitude * 10000) / 10000;
        void calcular(t("Minha localização", "My location"), lat, lon);
      },
      () => {
        setOcupado(null);
        setAviso({
          tipo: "erro",
          pt: "Não foi possível obter a localização (permissão negada ou sinal fraco). Busque pelo nome do município.",
          en: "Could not get the location (permission denied or weak signal). Search by municipality name.",
        });
      },
      { timeout: 15_000, maximumAge: 600_000 },
    );
  };

  return (
    <div className="rounded-2xl border border-gt-line bg-gt-card2 p-3">
      <p className="text-sm font-semibold">{t("Outro município do Sul do Brasil", "Another municipality in southern Brazil")}</p>
      <form onSubmit={buscar} className="mt-2 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="busca-municipio">
          {t("Nome do município", "Municipality name")}
        </label>
        <input
          id="busca-municipio"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={t("Ex.: Guarapuava", "E.g. Guarapuava")}
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-full border border-gt-btn-line bg-gt-bg px-4 text-base text-gt-text placeholder:text-gt-faint"
        />
        <button
          type="submit"
          disabled={ocupado !== null || texto.trim().length < 2}
          className="min-h-11 rounded-full border border-gt-green bg-gt-green px-4 text-sm font-semibold text-gt-bg disabled:opacity-50"
        >
          {t("Buscar", "Search")}
        </button>
        <button
          type="button"
          onClick={usarGps}
          disabled={ocupado !== null}
          className="min-h-11 rounded-full border border-gt-btn-line bg-gt-card px-4 text-sm font-semibold text-gt-text disabled:opacity-50"
        >
          {t("Usar minha localização", "Use my location")}
        </button>
      </form>

      <div role="status" aria-live="polite" className="mt-2 text-sm">
        {ocupado === "buscando" && <p className="text-gt-muted">{t("Buscando…", "Searching…")}</p>}
        {ocupado === "baixando" && (
          <p className="text-gt-muted">
            {t(
              `Baixando 45 anos de dados da NASA para ${baixandoNome}… (alguns segundos)`,
              `Downloading 45 years of NASA data for ${baixandoNome}… (a few seconds)`,
            )}
          </p>
        )}
        {aviso && (
          <p
            className={`rounded-xl border p-3 ${
              aviso.tipo === "erro"
                ? "border-gt-risk-line bg-gt-risk-bg text-gt-risk-text"
                : "border-gt-frost-line bg-gt-frost-bg text-gt-frost-text"
            }`}
          >
            {t(aviso.pt, aviso.en)}
          </p>
        )}
      </div>

      {achados && achados.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {achados.map((l) => (
            <li key={`${l.nome}-${l.lat}-${l.lon}`}>
              <button
                onClick={() => calcular(l.estado ? `${l.nome} (${l.estado})` : l.nome, l.lat, l.lon)}
                disabled={ocupado !== null}
                className="min-h-11 w-full rounded-2xl border border-gt-btn-line bg-gt-card px-4 py-2 text-left hover:border-gt-faint disabled:opacity-50"
              >
                <span className="block font-extrabold">{l.nome}</span>
                <span className="block font-mono text-[11px] text-gt-faint">
                  {l.estado ?? "—"} · {l.lat.toFixed(2)}, {l.lon.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 font-mono text-[11px] leading-relaxed text-gt-faint">
        {t(
          "A busca usa o Open-Meteo (CC BY 4.0) e os dados vêm direto da NASA POWER, no seu navegador. Só o nome digitado (ou as coordenadas, se usar a localização) é enviado a esses serviços; nada é guardado.",
          "The search uses Open-Meteo (CC BY 4.0) and the data come straight from NASA POWER, in your browser. Only the typed name (or the coordinates, if you use your location) is sent to those services; nothing is stored.",
        )}
      </p>
    </div>
  );
}
