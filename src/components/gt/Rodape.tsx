"use client";

import type { LocalView } from "@/lib/view-data";
import { Disclosure } from "@/components/ui/Disclosure";
import { Fonte } from "@/components/ui/Fonte";
import { fmtData, useLang, useT } from "@/lib/i18n";

export function Rodape({ local }: { local: LocalView }) {
  const t = useT();
  const lang = useLang();
  return (
    <footer className="mt-8 border-t border-line pb-10 pt-6 text-sm">
      <Disclosure titulo={t("Fontes e limitações", "Sources and limitations")}>
        <div className="flex flex-col gap-3">
          <Fonte>
            {t("Dados:", "Data:")} NASA POWER Daily API, community AG (T2M_MIN, PRECTOTCORR, GWETROOT),{" "}
            {fmtData(local.periodoDados.inicio, lang)} {t("a", "to")} {fmtData(local.periodoDados.fim, lang)},{" "}
            {t("baixados em", "downloaded on")} {fmtData(local.downloadedAt.slice(0, 10), lang)}.{" "}
            <a href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/" target="_blank" rel="noreferrer">
              API
            </a>
            . {t("Limiar de 3 °C: diferença abrigo–relva de 3–6 °C", "3 °C threshold: screen-to-grass difference of 3–6 °C")} (
            <a
              href="https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1084446/1/ID442832017CBAGRO20MM398.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Embrapa Trigo
            </a>
            ,{" "}
            <a
              href="https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1139138/1/BolAgroClimatico-dez21.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Embrapa
            </a>
            ,{" "}
            <a
              href="https://ojs.uel.br/revistas/uel/index.php/semagrarias/article/download/30322/24555/166627"
              target="_blank"
              rel="noreferrer"
            >
              Semina/UEL
            </a>
            ).
          </Fonte>
          <Fonte>
            {t(
              `Limitações: o NASA POWER é uma grade de ~50 km (elevação média da célula: ${local.elevacaoGradeM ?? "?"} m); a temperatura é do ar a 2 m, não da planta; fases das culturas e limiares são hipóteses a calibrar; o ajuste de baixada é uma hipótese (+1 °C) e o relevo SRTM ainda não classifica cada talhão; isto não é previsão do tempo e os níveis de risco ainda não foram confirmados contra a produtividade real (teste com o IBGE sem resultado conclusivo). Ferramenta de apoio: a decisão é do agricultor com o técnico.`,
              `Limitations: NASA POWER is a ~50 km grid (mean cell elevation: ${local.elevacaoGradeM ?? "?"} m); temperature is 2 m air temperature, not at the plant; crop stages and thresholds are hypotheses to calibrate; the lowland adjustment is a hypothesis (+1 °C) and SRTM relief does not yet classify each plot; this is not a weather forecast, and the risk levels are not yet confirmed against real yields (the IBGE test was inconclusive). A support tool: the decision belongs to the farmer together with the technician.`,
            )}
          </Fonte>
        </div>
      </Disclosure>
      <Fonte className="mt-4">
        {t(
          "Ferramenta de apoio à decisão: não substitui o agricultor nem o agrônomo. Feito para o NASA Space Apps Challenge 2026.",
          "Decision-support tool: it does not replace the farmer or the agronomist. Built for the NASA Space Apps Challenge 2026.",
        )}
      </Fonte>
    </footer>
  );
}
