"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheck, CloudSun, OctagonAlert, Snowflake, TriangleAlert } from "lucide-react";
import { avaliarPrevisao, PARAMS_PREVISAO, type PrevisaoDiaria } from "@/lib/engine/previsao.ts";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Fonte } from "@/components/ui/Fonte";
import { fmtDia, fmtNum, useLang, useT } from "@/lib/i18n";

type Estado = { tipo: "carregando" } | { tipo: "erro" } | { tipo: "ok"; dados: PrevisaoDiaria };

interface Props {
  nome: string;
  lat: number;
  lon: number;
  baixada: boolean;
  limiteGeadaC: number;
  ajusteBaixadaC: number;
}

/** Card "Posso plantar esta semana?": só consulta o Open-Meteo depois que a pessoa toca em "Ver previsão". */
export function Previsao(props: Props) {
  const t = useT();
  const [pedida, setPedida] = useState(false);
  return (
    <Card>
      <CardHeader
        eyebrow={t("Próximos 16 dias", "Next 16 days")}
        title={
          <span className="inline-flex items-center gap-2">
            <CloudSun className="size-6 text-brand" aria-hidden="true" />
            {t("Posso plantar a soja esta semana?", "Can I plant soybeans this week?")}
          </span>
        }
      />
      {!pedida ? (
        <div className="mt-3 flex flex-col items-start gap-3">
          <p className="text-ink-muted">
            {t(
              `Consulta a previsão do tempo para ${props.nome}. Só as coordenadas públicas do município são enviadas.`,
              `Checks the weather forecast for ${props.nome}. Only the municipality’s public coordinates are sent.`,
            )}
          </p>
          <Button onClick={() => setPedida(true)}>{t("Ver previsão", "Show forecast")}</Button>
        </div>
      ) : (
        <PrevisaoConteudo {...props} />
      )}
    </Card>
  );
}

function PrevisaoConteudo({ lat, lon, baixada, limiteGeadaC, ajusteBaixadaC }: Props) {
  const t = useT();
  const lang = useLang();
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
        if (!j?.daily?.time) throw new Error("unexpected response");
        setEstado({ tipo: "ok", dados: j.daily as PrevisaoDiaria });
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
        ? avaliarPrevisao(estado.dados, { ...PARAMS_PREVISAO, limiteGeadaC }, baixada ? ajusteBaixadaC : 0, lang)
        : null,
    [estado, limiteGeadaC, baixada, ajusteBaixadaC, lang],
  );

  return (
    <div className="mt-3">
      {estado.tipo === "carregando" && <p className="text-ink-muted">{t("Buscando a previsão…", "Loading the forecast…")}</p>}
      {estado.tipo === "erro" && (
        <Callout tom="info">
          <p className="text-sm">
            {t(
              "Não foi possível carregar a previsão agora (serviço indisponível ou sem internet). O restante da página usa dados históricos e continua valendo. Tente de novo mais tarde.",
              "The forecast could not be loaded right now (service unavailable or offline). The rest of the page uses historical data and still applies. Please try again later.",
            )}
          </p>
        </Callout>
      )}

      {estado.tipo === "ok" && av && (
        <>
          <div role="status">
            <Callout
              tom={av.nivel === "nao-plantar" ? "alto" : av.nivel === "atencao" ? "cautela" : "positivo"}
              icone={av.nivel === "nao-plantar" ? OctagonAlert : av.nivel === "atencao" ? TriangleAlert : CircleCheck}
            >
              <p className="text-xl font-extrabold">{av.titulo}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {av.mensagens.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </Callout>
          </div>

          <div
            className="mt-4 flex snap-x gap-1.5 overflow-x-auto pb-2"
            role="list"
            aria-label={t("Previsão dia a dia", "Day-by-day forecast")}
          >
            {estado.dados.time.map((d, i) => {
              const tmin = estado.dados.temperature_2m_min[i];
              const chuva = estado.dados.precipitation_sum[i];
              const frio = tmin !== null && tmin <= limite;
              const forte = chuva !== null && chuva >= PARAMS_PREVISAO.chuvaForteMm;
              return (
                <div
                  key={d}
                  role="listitem"
                  className={`min-w-16 snap-start rounded-xl border p-2 text-center ${
                    frio
                      ? "border-frost/40 bg-frost-soft text-frost-ink"
                      : i < PARAMS_PREVISAO.diasSemana
                        ? "border-line-strong bg-surface"
                        : "border-line bg-surface-2"
                  }`}
                >
                  <p className="text-[13px] text-ink-faint">{fmtDia(d.slice(5, 10), lang)}</p>
                  <p className="flex items-center justify-center gap-0.5 text-sm font-extrabold tabular-nums">
                    {frio && <Snowflake className="size-4" aria-hidden="true" />}
                    {tmin === null ? "–" : `${fmtNum(tmin, 1, lang)}°`}
                  </p>
                  <p className={`text-[13px] tabular-nums ${forte ? "font-bold text-drought" : "text-ink-muted"}`}>
                    {chuva === null ? "–" : `${fmtNum(chuva, 1, lang)} mm`}
                  </p>
                </div>
              );
            })}
          </div>
          <Fonte className="inline-flex flex-wrap items-center gap-1">
            {t(
              `Cada dia: temperatura mínima do ar a 2 m e chuva prevista. Azul com`,
              `Each day: 2 m air minimum temperature and forecast rain. Blue with`,
            )}
            <Snowflake className="size-4" aria-hidden="true" />
            {t(
              `= mínima ≤ ${limite} °C. Os 7 primeiros dias têm fundo branco.`,
              `= minimum ≤ ${limite} °C. The first 7 days have a white background.`,
            )}
          </Fonte>
        </>
      )}

      <div className="mt-3 flex flex-col gap-1">
        <Fonte>
          {t(
            `Regras de exemplo, a validar com agronomia: geada (mínima ≤ ${limite} °C) ou chuva ≥ ${PARAMS_PREVISAO.chuvaForteMm} mm nos próximos ${PARAMS_PREVISAO.diasSemana} dias = “não plante esta semana”; menos de ${PARAMS_PREVISAO.chuvaMinSemanaMm} mm na semana = atenção. Previsão não é garantia e a incerteza cresce depois de ~7 dias. Confira também o ZARC e o vazio sanitário.`,
            `Example rules, to be validated with agronomy: frost (minimum ≤ ${limite} °C) or rain ≥ ${PARAMS_PREVISAO.chuvaForteMm} mm in the next ${PARAMS_PREVISAO.diasSemana} days = “do not plant this week”; less than ${PARAMS_PREVISAO.chuvaMinSemanaMm} mm in the week = caution. A forecast is not a guarantee and uncertainty grows after ~7 days. Also check the ZARC window and the soybean-free period (“vazio sanitário”).`,
          )}
        </Fonte>
        <Fonte>
          {t("Previsão:", "Forecast:")}{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo.com
          </a>{" "}
          {t(
            "(CC BY 4.0, uso não comercial). Só as coordenadas públicas do município são enviadas ao serviço.",
            "(CC BY 4.0, non-commercial use). Only the municipality’s public coordinates are sent to the service.",
          )}
        </Fonte>
      </div>
    </div>
  );
}
