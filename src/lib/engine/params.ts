// Parâmetros do motor de risco do GroundTruth.
//
// ⚠️ VALORES DE EXEMPLO — A VALIDAR com agronomia / ZARC (MAPA).
// Ciclos variam com a cultivar, a região e o manejo. Não são recomendação técnica.
// A interface deve exibir que estes números são "valores de exemplo".

export interface EngineParams {
  /** Dias do plantio à colheita da soja. */
  cicloSoja: number;
  /** Dias entre a colheita da soja e o plantio do milho safrinha. */
  intervalo: number;
  /** Dias do plantio do milho safrinha até o florescimento (pendoamento). */
  diasAteFlorescer: number;
  /** T2M_MIN (ar a 2 m) igual ou abaixo deste valor conta como risco de geada. A validar: 2 °C ou 3 °C. */
  limiteGeadaC: number;
  /** Meia-janela, em dias, em torno da data de floração: [floração - janela, floração + janela]. */
  janelaFloracaoDias: number;
  /** Dias após o plantio do milho analisados para seca. */
  diasSecaInicio: number;
  /** Abaixo deste valor (mm/dia) o dia conta como seco. */
  chuvaDiaSecoMm: number;
  /** Sequência de dias secos que caracteriza seca. */
  sequenciaSecaDias: number;
  /** Percentil histórico de GWETROOT médio abaixo do qual o início é considerado seco. */
  percentilUmidadeSolo: number;
}

export const PARAMS_PADRAO: EngineParams = {
  cicloSoja: 120,
  intervalo: 5,
  diasAteFlorescer: 65,
  limiteGeadaC: 2,
  janelaFloracaoDias: 10,
  diasSecaInicio: 30,
  chuvaDiaSecoMm: 1,
  sequenciaSecaDias: 15,
  percentilUmidadeSolo: 20,
};

/** Datas de plantio da soja comparadas (dia/mês), no formato "MM-DD". */
export const DATAS_SOJA_PADRAO = ["10-01", "10-10", "10-20", "10-30", "11-10"] as const;
