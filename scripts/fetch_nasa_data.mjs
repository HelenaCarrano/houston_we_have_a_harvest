// scripts/fetch_nasa_data.mjs
// Baixa a CLIMATOLOGIA MENSAL real da NASA POWER (médias de longo prazo).
// Atenção: elevationSRTM abaixo está fixo no código e ainda não foi conferido com o SRTM.

import fs from 'node:fs';
import path from 'node:path';

const LOCATIONS = [
  {
    id: 'pato-branco',
    name: 'Pato Branco',
    region: 'Sudoeste Paranaense',
    state: 'PR',
    lat: -26.2295,
    lon: -52.6716,
    elevationSRTM: 733,
    description: 'Polo do Sudoeste do PR, forte transição entre soja no verão e milho safrinha / trigo no inverno.'
  },
  {
    id: 'cascavel',
    name: 'Cascavel',
    region: 'Oeste Paranaense',
    state: 'PR',
    lat: -24.9578,
    lon: -53.4595,
    elevationSRTM: 781,
    description: 'Grande polo do Oeste do PR, alta intensidade de soja e milho safrinha.'
  },
  {
    id: 'francisco-beltrao',
    name: 'Francisco Beltrão',
    region: 'Sudoeste Paranaense',
    state: 'PR',
    lat: -26.0811,
    lon: -53.0558,
    elevationSRTM: 650,
    description: 'Bacia do Rio Marrecas, baixadas suscetíveis a geadas severas por inversão térmica.'
  }
];

async function fetchClimatology(lat, lon) {
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M_MIN,T2M_MAX,PRECTOTCORR,GWETTOP,GWETROOT&community=AG&longitude=${lon}&latitude=${lat}&format=JSON`;
  console.log(`Fetching NASA POWER climatology for (${lat}, ${lon})...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch climatology: ${response.statusText}`);
  }
  return await response.json();
}

async function run() {
  const outDir = path.resolve('src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const results = [];

  for (const loc of LOCATIONS) {
    try {
      const clim = await fetchClimatology(loc.lat, loc.lon);
      const params = clim.properties.parameter;
      
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthlyData = months.map((m, idx) => ({
        month: m,
        monthName: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][idx],
        minTemp: params.T2M_MIN[m],
        maxTemp: params.T2M_MAX[m],
        precipitationMmDay: params.PRECTOTCORR[m],
        totalPrecipMmMonth: Math.round(params.PRECTOTCORR[m] * (idx === 1 ? 28 : [3, 5, 8, 10].includes(idx) ? 30 : 31)),
        soilMoistureRoot: params.GWETROOT ? params.GWETROOT[m] : 0.65,
        soilMoistureTop: params.GWETTOP ? params.GWETTOP[m] : 0.55
      }));

      results.push({
        ...loc,
        climatology: monthlyData,
        rawHeader: clim.header
      });
      console.log(`✓ Fetched data for ${loc.name}`);
    } catch (err) {
      console.error(`Error fetching for ${loc.name}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(outDir, 'nasa_locations_climatology.json'), JSON.stringify(results, null, 2));
  console.log('Saved src/data/nasa_locations_climatology.json');

  // Eventos históricos agora são calculados dos dados diários reais:
  // node scripts/fetch_power_daily.mjs && node scripts/build_historical_events.mjs
}

run();
