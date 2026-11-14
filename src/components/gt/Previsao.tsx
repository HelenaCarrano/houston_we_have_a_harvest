"use client";

import { useEffect, useMemo, useState } from "react";
import { avaliarPrevisao, PARAMS_PREVISAO, type PrevisaoDiaria } from "@/lib/engine/previsao.ts";

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const n1 = (x: number) => x.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro" }
  | { tipo: "ok"; dados: PrevisaoDiaria; atualizadoEm: string };

interface Props {
  nome: string;
  lat: number;
  lon: number;
  baixada: boolean;
  limiteGeadaC: number;
  ajusteBaixadaC: number;
}

/** Previsão de 16 dias (Open-Meteo) lida no navegador; se falhar, a página continua funcionando. */
export function Previsao({ nome, lat, lon, baixada, limiteGeadaC, ajusteBaixadaC }: Props) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  useEffect(() => {
    const ctrl = new AbortController();
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&forecast_days=16&timezone=America%2FSao_Paulo`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        if (!j?.daily?.time) throw new Error("resposta inesperada");
        setEstado({ tipo: "ok", dados: j.daily as PrevisaoDiaria, atualizadoEm: new Date().toISOString() });
      })
      .catch((e: unknown) => {
        if ((e as Error)?.name !== "AbortError") setEstado({ tipo: "erro" });
      });
    return () => ctrl.abort();
  }, [lat, lon]);

  const limite = limiteGeadaC + (baixada ? ajusteBaixadaC : 0);
  const av = useMemo(
    () =>
      estado.tipo === "ok"
        ? avaliarPrevisao(estado.dados, { ...PARAMS_PREVISAO, limiteGeadaC }, baixada ? ajusteBaixadaC : 0)
        : null,
    [estado, limiteGeadaC, baixada, ajusteBaixadaC],
  );

  const cor =
    av?.nivel === "nao-plantar"
      ? "border-gt-orange bg-gt-risk-bg text-gt-risk-text"
      : av?.nivel === "atencao"
        ? "border-gt-risk-line bg-gt-risk-bg text-gt-risk-text"
        : "border-gt-safe-line bg-gt-safe-bg text-gt-safe-text";

  return (
    <section className="gt-rise rounded-[22px] border border-gt-line bg-gt-card p-4 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-gt-faint">
        Checagem antes de plantar · próximos 16 dias · {nome}
      </p>
      <h2 className="mt-1 text-2xl font-black">Posso plantar a soja agora?</h2>

      {estado.tipo === "carregando" && <p className="mt-3 text-gt-muted">Buscando a previsão…</p>}
      {estado.tipo === "erro" && (
        <p className="mt-3 rounded-xl border border-gt-line bg-gt-card2 p-3 text-sm text-gt-muted">
          Não foi possível carregar a previsão agora (serviço indisponível ou sem internet). O restante da página usa
          dados históricos e continua valendo. Tente de novo mais tarde.
        </p>
      )}

      {estado.tipo === "ok" && av && (
        <>
          <div className={`mt-3 rounded-[18px] border p-4 ${cor}`} role="status">
            <p className="text-xl font-black">
              {av.nivel === "nao-plantar" ? "⛔ " : av.nivel === "atencao" ? "⚠️ " : "✅ "}
              {av.titulo}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {av.mensagens.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-2" role="list" aria-label="Previsão dia a dia">
            {estado.dados.time.map((t, i) => {
              const tmin = estado.dados.temperature_2m_min[i];
              const chuva = estado.dados.precipitation_sum[i];
              const frio = tmin !== null && tmin <= limite;
              const forte = chuva !== null && chuva >= PARAMS_PREVISAO.chuvaForteMm;
              return (
                <div
                  key={t}
                  role="listitem"
                  className={`min-w-[3.9rem] rounded-xl border p-2 text-center ${
                    i < PARAMS_PREVISAO.diasSemana ? "border-gt-btn-line" : "border-gt-line"
                  } ${frio ? "bg-gt-frost-bg" : "bg-gt-card2"}`}
                >
                  <p className="font-mono text-[10px] text-gt-faint">{ddmm(t)}</p>
                  <p className={`text-sm font-extrabold ${frio ? "text-gt-frost" : ""}`}>
                    {tmin === null ? "–" : `${n1(tmin)}°`}
                  </p>
                  <p className={`font-mono text-[11px] ${forte ? "font-semibold text-gt-orange" : "text-gt-muted"}`}>
                    {chuva === null ? "–" : `${n1(chuva)} mm`}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[11px] text-gt-faint">
            Cada dia: temperatura mínima do ar a 2 m e chuva prevista. Azul = mínima ≤ {limite} °C. Os 7 primeiros dias
            têm borda mais clara.
          </p>
        </>
      )}

      <div className="mt-3 flex flex-col gap-1">
        <p className="font-mono text-[11px] leading-relaxed text-gt-faint">
          Regras de exemplo, a validar com agronomia: geada (mínima ≤ {limite} °C) ou chuva ≥ {PARAMS_PREVISAO.chuvaForteMm} mm
          nos próximos {PARAMS_PREVISAO.diasSemana} dias = “não plante esta semana”; menos de {PARAMS_PREVISAO.chuvaMinSemanaMm} mm na
          semana = atenção. Previsão não é garantia e a incerteza cresce depois de ~7 dias. Confira também o ZARC e o
          vazio sanitário.
        </p>
        <p className="font-mono text-[11px] text-gt-faint">
          Previsão:{" "}
          <a className="underline underline-offset-2" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo.com
          </a>{" "}
          (CC BY 4.0, uso não comercial). Só as coordenadas públicas do município são enviadas ao serviço.
        </p>
      </div>
    </section>
  );
}
