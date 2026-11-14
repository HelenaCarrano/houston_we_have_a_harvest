// scripts/build_historical_events.mjs
// Gera src/data/historical_events_40years.json a partir dos dados DIÁRIOS reais da NASA POWER
// (src/data/power_daily_pato-branco.json). Nada aqui é inventado: cada campo é calculado
// a partir dos dados ou marcado explicitamente como "sem dado".
//
// Critérios (valores de exemplo, a validar com agronomia):
//   - frostDaysCritical: dias de maio a julho com T2M_MIN <= 2 °C (temperatura do ar a 2 m)
//   - lowestTempCelsius: menor T2M_MIN de maio a julho
//   - aprilRainMm: soma de PRECTOTCORR em abril
//   - hasSevereFrost: frostDaysCritical >= 1
//   - hasSevereDrought: chuva de abril abaixo do percentil 20 de 1981–2025
//
// Uso: node scripts/build_historical_events.mjs

import fs from "node:fs";
import path from "node:path";

const FROST_LIMIT_C = 2;
const SRC = path.resolve("src/data/power_daily_pato-branco.json");
const OUT = path.resolve("src/data/historical_events_40years.json");

const daily = JSON.parse(fs.readFileSync(SRC, "utf8"));
const start = new Date(`${daily.meta.start}T00:00:00Z`);
const { T2M_MIN, PRECTOTCORR } = daily.data;

const byYear = new Map();
for (let i = 0; i < T2M_MIN.length; i++) {
  const d = new Date(start.getTime() + i * 86400000);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  if (!byYear.has(y)) byYear.set(y, { tmin: [], aprRain: 0, aprDays: 0 });
  const e = byYear.get(y);
  if (m >= 5 && m <= 7 && T2M_MIN[i] !== null) e.tmin.push(T2M_MIN[i]);
  if (m === 4 && PRECTOTCORR[i] !== null) {
    e.aprRain += PRECTOTCORR[i];
    e.aprDays++;
  }
}

// percentil 20 da chuva de abril (anos completos 1981–2025)
const aprilHist = [...byYear.entries()]
  .filter(([y, e]) => y <= 2025 && e.aprDays === 30)
  .map(([, e]) => e.aprRain)
  .sort((a, b) => a - b);
const p20 = aprilHist[Math.floor(0.2 * (aprilHist.length - 1))];

// Único registro de campo usado: Deral 2026 (fontes no README). Anos antigos: sem dado.
const DERAL_2026 =
  "Deral (mai/2026): geadas queimaram folhas do milho safrinha em baixadas; feijão 2ª safra com perdas; trigo sem dano significativo.";

const events = [];
for (const [year, e] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
  if (e.tmin.length < 92 || e.aprDays < 30) continue; // só anos com maio–jul e abril completos
  const frostDays = e.tmin.filter((t) => t <= FROST_LIMIT_C).length;
  const lowest = Math.min(...e.tmin);
  const aprilRain = Math.round(e.aprRain);
  const severeFrost = frostDays >= 1;
  const severeDrought = e.aprRain < p20;
  events.push({
    year,
    enso: "Sem classificação ONI",
    frostDaysCritical: frostDays,
    lowestTempCelsius: Math.round(lowest * 10) / 10,
    aprilRainMm: aprilRain,
    hasSevereFrost: severeFrost,
    hasSevereDrought: severeDrought,
    cropLossReportedDeral: year === 2026 ? DERAL_2026 : "Sem dado de perda no app",
    safrinhaCornStatus: "Não avaliado",
    wheatStatus: "Não avaliado",
    intercroppedStatus: "Não avaliado",
  });
}

fs.writeFileSync(OUT, JSON.stringify(events, null, 2));
console.log(
  `✓ ${OUT}: ${events.length} anos (${events[0].year}–${events.at(-1).year}); ` +
    `P20 chuva abril = ${p20.toFixed(0)} mm; anos com T2M_MIN <= ${FROST_LIMIT_C} °C em mai–jul: ` +
    events.filter((x) => x.hasSevereFrost).map((x) => x.year).join(", "),
);
