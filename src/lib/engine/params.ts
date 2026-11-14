// Parâmetros do motor de risco do GroundTruth.
// Alinhados ao documento "GroundTruth — Metodologia e validação" (time, 14/11/2026).
//
// ⚠️ HIPÓTESES DE PARTIDA — A VALIDAR com agronomia / ZARC (MAPA) e com o caso de 2026.
// Ciclos variam com a cultivar, a região e o manejo. Não são recomendação técnica.

export interface EngineParams {
  /** Dias do plantio à colheita da soja. */
  cicloSoja: number;
  /** Dias entre a colheita da soja e o plantio do milho safrinha. */
  intervalo: number;
  /** Dias do plantio do milho até o florescimento (marcador na linha do tempo). */
  diasAteFlorescer: number;
  /** Fase crítica do milho safrinha (pendoamento e enchimento de grãos): início, em dias após o plantio. */
  faseCriticaInicio: number;
  /** Fase crítica do milho safrinha: fim, em dias após o plantio. */
  faseCriticaFim: number;
  /** Geada provável: T2M_MIN (ar a 2 m) <= este valor. Base: diferença abrigo–relva de 3–6 °C (Embrapa, UEL). */
  limiteGeadaC: number;
  /** Geada forte: T2M_MIN <= este valor. */
  limiteGeadaForteC: number;
  /** Em baixadas (acúmulo de ar frio), o limite de geada sobe este tanto. */
  ajusteBaixadaC: number;
  /** Abaixo deste valor (mm/dia) o dia conta como seco. */
  chuvaDiaSecoMm: number;
  /** Veranico: sequência mínima de dias secos. */
  sequenciaSecaDias: number;
  /** Percentil de GWETROOT (mesmas datas do ano) abaixo do qual o solo está seco. */
  percentilUmidadeSolo: number;
}

export const PARAMS_PADRAO: EngineParams = {
  cicloSoja: 120,
  intervalo: 5,
  diasAteFlorescer: 65,
  faseCriticaInicio: 55,
  faseCriticaFim: 100,
  limiteGeadaC: 3,
  limiteGeadaForteC: 1,
  ajusteBaixadaC: 1,
  chuvaDiaSecoMm: 1,
  sequenciaSecaDias: 15,
  percentilUmidadeSolo: 20,
};

/** Datas de plantio da soja comparadas (dia/mês), no formato "MM-DD". */
export const DATAS_SOJA_PADRAO = ["10-01", "10-10", "10-20", "10-30", "11-10"] as const;
