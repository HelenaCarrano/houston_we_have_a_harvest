// Testes do motor: node --test (Node 24 executa TypeScript direto).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  cronograma,
  riscoGeada,
  riscoSeca,
  riscoPorData,
  confianca,
  percentil,
  deCada10,
  PARAMS_PADRAO,
  type DadosDiarios,
} from "./index.ts";

const DIA = 86_400_000;

/** Série sintética: 2000-01-01 a 2005-12-31, tudo "bom" (quente, chuvoso, solo úmido). */
function sintetico(): DadosDiarios {
  const ini = Date.UTC(2000, 0, 1);
  const n = Math.round((Date.UTC(2005, 11, 31) - ini) / DIA) + 1;
  return {
    meta: { start: "2000-01-01", end: "2005-12-31" },
    data: {
      T2M_MIN: Array(n).fill(12),
      T2M_MAX: Array(n).fill(25),
      PRECTOTCORR: Array(n).fill(5),
      GWETROOT: Array(n).fill(0.7),
      GWETTOP: Array(n).fill(0.7),
    },
  };
}
function idx(d: DadosDiarios, iso: string) {
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${d.meta.start}T00:00:00Z`)) / DIA);
}

test("cronograma soma ciclo, intervalo e dias até florescer", () => {
  const c = cronograma(new Date(Date.UTC(2024, 9, 1)), PARAMS_PADRAO); // 01/10/2024
  assert.equal(c.colheitaSoja.toISOString().slice(0, 10), "2025-01-29"); // +120
  assert.equal(c.plantioMilho.toISOString().slice(0, 10), "2025-02-03"); // +5
  assert.equal(c.floracaoMilho.toISOString().slice(0, 10), "2025-04-09"); // +65
  assert.equal(c.janelaInicio.toISOString().slice(0, 10), "2025-03-30");
  assert.equal(c.janelaFim.toISOString().slice(0, 10), "2025-04-19");
});

test("riscoGeada detecta frio só dentro da janela de floração", () => {
  const d = sintetico();
  // Plantio 01/10/2001 → floração 09/04/2002. Frio dentro da janela:
  d.data.T2M_MIN[idx(d, "2002-04-12")] = 1.5;
  // Frio fora da janela em 2003 (não deve contar):
  d.data.T2M_MIN[idx(d, "2003-07-01")] = -3;
  const r = riscoGeada(d, "10-01");
  // Anos com janela completa: safrinhas 2001..2005 (plantios 2000..2004)
  assert.equal(r.totalAnos, 5);
  assert.deepEqual(r.anosListados, [2002]);
  assert.equal(r.anosComEvento, 1);
  assert.equal(r.frequencia, 0.2);
});

test("riscoGeada ignora anos com dado ausente na janela", () => {
  const d = sintetico();
  d.data.T2M_MIN[idx(d, "2002-04-09")] = null;
  const r = riscoGeada(d, "10-01");
  assert.equal(r.totalAnos, 4);
});

test("riscoSeca: sequência de 15 dias sem chuva marca ano seco", () => {
  const d = sintetico();
  // Plantio do milho em 03/02/2003 (soja 01/10/2002)
  const i = idx(d, "2003-02-05");
  for (let k = 0; k < 15; k++) d.data.PRECTOTCORR[i + k] = 0.2;
  const r = riscoSeca(d, "10-01");
  assert.ok(r.anosListados.includes(2003));
  assert.equal(r.porAno.find((a) => a.ano === 2003)?.valor, 15);
});

test("riscoSeca: umidade do solo abaixo do percentil marca ano seco", () => {
  const d = sintetico();
  const i = idx(d, "2004-02-03"); // plantio do milho, soja 01/10/2003 (2004 é bissexto: 01/10/2003+125 = 03/02/2004)
  for (let k = 0; k < 30; k++) d.data.GWETROOT[i + k] = 0.3;
  const r = riscoSeca(d, "10-01");
  assert.deepEqual(r.anosListados, [2004]);
});

test("riscoPorData retorna as 5 datas padrão", () => {
  const r = riscoPorData(sintetico(), PARAMS_PADRAO, undefined, 2003);
  assert.deepEqual(
    r.map((x) => x.dataSoja),
    ["10-01", "10-10", "10-20", "10-30", "11-10"],
  );
  assert.ok(r.every((x) => x.geada.totalAnos > 0 && x.seca.totalAnos > 0));
});

test("confianca e utilitários", () => {
  assert.equal(confianca(35), "alta");
  assert.equal(confianca(25), "alta");
  assert.equal(confianca(24), "média");
  assert.equal(confianca(12), "média");
  assert.equal(confianca(11), "baixa");
  assert.equal(percentil([1, 2, 3, 4, 5], 50), 3);
  assert.equal(deCada10(0.27), 3);
});

test("dados reais de Pato Branco carregam e cobrem ~35 safras", () => {
  const real = JSON.parse(
    fs.readFileSync(new URL("../../data/power_daily_pato-branco.json", import.meta.url), "utf8"),
  ) as DadosDiarios;
  const r = riscoGeada(real, "10-01");
  assert.ok(r.totalAnos >= 34, `totalAnos=${r.totalAnos}`);
  assert.equal(confianca(r.totalAnos), "alta");
});
