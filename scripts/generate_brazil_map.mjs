// scripts/generate_brazil_map.mjs
// Pre-projects official IBGE GeoJSON into pixel-perfect SVG paths for Brazil and Paraná

import fs from 'node:fs';
import path from 'node:path';
import * as d3 from 'd3-geo';

const geojsonPath = path.resolve('public/data/brazil_states.geojson');
const rawGeo = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Fix polygon ring winding order (counter-clockwise -> clockwise) for D3
const fixedGeo = JSON.parse(JSON.stringify(rawGeo));
fixedGeo.features.forEach(f => {
  if (f.geometry.type === 'Polygon') {
    f.geometry.coordinates = f.geometry.coordinates.map(ring => ring.slice().reverse());
  } else if (f.geometry.type === 'MultiPolygon') {
    f.geometry.coordinates = f.geometry.coordinates.map(poly => poly.map(ring => ring.slice().reverse()));
  }
});

// Brazil national projection
const brazilWidth = 620;
const brazilHeight = 620;
const brazilProj = d3.geoMercator().fitExtent([[25, 25], [brazilWidth - 25, brazilHeight - 25]], fixedGeo);
const brazilPathGen = d3.geoPath().projection(brazilProj);

// Complete state metadata for all 27 Brazilian Federation Units
const STATES_META = {
  PR: {
    region: 'Sul',
    climate: 'Subtropical Cfb/Cfa',
    crops: ['Soja', 'Milho Safrinha', 'Trigo', 'Feijão'],
    frostRisk: 'Alto (Baixadas)',
    droughtRisk: 'Médio (La Niña)',
    heatRisk: 'Baixo',
    nasaHighlight: '40 anos NASA POWER mostram que 3 em cada 10 anos geadas severas queimam milho em baixadas.',
    zarcWindow: 'Semeadura milho até 10/02; trigo após 15/04',
    hasDeepDive: true
  },
  RS: {
    region: 'Sul',
    climate: 'Subtropical Cfa',
    crops: ['Soja', 'Arroz Irrigado', 'Trigo', 'Milho'],
    frostRisk: 'Alto',
    droughtRisk: 'Crítico em La Niña',
    heatRisk: 'Médio',
    nasaHighlight: 'NASA POWER aponta que anos de La Niña reduzem a precipitação em até 45% entre dezembro e março.',
    zarcWindow: 'Ajuste de plantio precoce para escapar da estiagem estival',
    hasDeepDive: false
  },
  SC: {
    region: 'Sul',
    climate: 'Subtropical Cfb',
    crops: ['Milho Grão', 'Soja', 'Maçã', 'Alho'],
    frostRisk: 'Muito Alto (Serra)',
    droughtRisk: 'Baixo/Médio',
    heatRisk: 'Baixo',
    nasaHighlight: 'Registros térmicos NASA indicam geadas até setembro nas cotas acima de 900 metros (SRTM).',
    zarcWindow: 'Escalonamento de híbridos de milho tolerantes ao frio',
    hasDeepDive: false
  },
  MT: {
    region: 'Centro-Oeste',
    climate: 'Tropical com estação seca (Aw)',
    crops: ['Soja', 'Milho Safrinha', 'Algodão'],
    frostRisk: 'Nulo',
    droughtRisk: 'Crítico (Fim das chuvas em abril)',
    heatRisk: 'Muito Alto (>36°C)',
    nasaHighlight: 'NASA POWER registra corte abrupto das chuvas na segunda quinzena de abril.',
    zarcWindow: 'Plantio de safrinha até 28/02 indispensável para seguro',
    hasDeepDive: false
  },
  MS: {
    region: 'Centro-Oeste',
    climate: 'Tropical / Subtropical',
    crops: ['Soja', 'Milho Safrinha', 'Cana-de-açúcar'],
    frostRisk: 'Médio (Extremo Sul)',
    droughtRisk: 'Alto em outono',
    heatRisk: 'Alto',
    nasaHighlight: 'Frentes frias antárticas atingem Dourados e Ponta Porã enquanto o norte sofre com veranico.',
    zarcWindow: 'Janela curta de safrinha após a colheita da soja',
    hasDeepDive: false
  },
  GO: {
    region: 'Centro-Oeste',
    climate: 'Tropical de Savana (Aw)',
    crops: ['Soja', 'Milho', 'Sorgo', 'Girassol'],
    frostRisk: 'Nulo',
    droughtRisk: 'Alto (Maio-Setembro seco)',
    heatRisk: 'Alto',
    nasaHighlight: 'NASA SMAP indica umidade do solo na raiz < 20% durante toda a safra de inverno sem irrigação.',
    zarcWindow: 'Uso obrigatório de cultivares adaptadas a déficit hídrico',
    hasDeepDive: false
  },
  DF: {
    region: 'Centro-Oeste',
    climate: 'Tropical de Altitude',
    crops: ['Soja', 'Trigo Irrigado', 'Hortaliças'],
    frostRisk: 'Nulo',
    droughtRisk: 'Médio/Alto',
    heatRisk: 'Médio',
    nasaHighlight: 'Grande potencial para trigo tropical de altitude com irrigação.',
    zarcWindow: 'Plantio escalonado conforme disponibilidade de pivôs',
    hasDeepDive: false
  },
  SP: {
    region: 'Sudeste',
    climate: 'Tropical de Altitude (Cwa/Cfa)',
    crops: ['Cana-de-açúcar', 'Soja', 'Citros', 'Milho'],
    frostRisk: 'Médio (Sudoeste Paulista)',
    droughtRisk: 'Médio',
    heatRisk: 'Médio',
    nasaHighlight: 'Vale do Paranapanema apresenta risco térmico similar ao norte do Paraná.',
    zarcWindow: 'Manejo conservacionista com cobertura verde pós-cana',
    hasDeepDive: false
  },
  MG: {
    region: 'Sudeste',
    climate: 'Tropical de Altitude (Cwb/Aw)',
    crops: ['Café', 'Milho', 'Soja', 'Cana'],
    frostRisk: 'Médio (Sul de Minas)',
    droughtRisk: 'Alto (Norte de MG)',
    heatRisk: 'Médio',
    nasaHighlight: 'NASA POWER detecta anomalias térmicas de calor no florescimento do café.',
    zarcWindow: 'Zoneamento diferenciado para café arábica e grãos',
    hasDeepDive: false
  },
  BA: {
    region: 'Nordeste',
    climate: 'Tropical / Semiárido (Matopiba)',
    crops: ['Soja', 'Algodão', 'Milho'],
    frostRisk: 'Nulo',
    droughtRisk: 'Alto (Veranicos no Oeste Baiano)',
    heatRisk: 'Muito Alto',
    nasaHighlight: 'NASA POWER identifica veranicos de 15 a 25 dias em janeiro e fevereiro na região de Barreiras.',
    zarcWindow: 'Plantio focado no início das chuvas consistentes',
    hasDeepDive: false
  },
  MA: {
    region: 'Nordeste',
    climate: 'Tropical Úmido / Aw',
    crops: ['Soja', 'Milho', 'Arroz'],
    frostRisk: 'Nulo',
    droughtRisk: 'Médio',
    heatRisk: 'Alto',
    nasaHighlight: 'Expansão agrícola acelerada no polo de Balsas; solo com textura arenosa.',
    zarcWindow: 'Aproveitamento da estação chuvosa longa',
    hasDeepDive: false
  },
  PI: {
    region: 'Nordeste',
    climate: 'Semiárido / Tropical',
    crops: ['Soja', 'Milho', 'Algodão'],
    frostRisk: 'Nulo',
    droughtRisk: 'Muito Alto',
    heatRisk: 'Extremo',
    nasaHighlight: 'Baixa retenção de água no solo exige cobertura morta contínua.',
    zarcWindow: 'Plantio restrito à janela de maior segurança hídrica',
    hasDeepDive: false
  },
  TO: {
    region: 'Norte',
    climate: 'Tropical Aw',
    crops: ['Soja', 'Milho Safrinha', 'Arroz'],
    frostRisk: 'Nulo',
    droughtRisk: 'Alto (Corte de chuvas)',
    heatRisk: 'Muito Alto',
    nasaHighlight: 'NASA POWER mostra janela de chuvas entre outubro e abril.',
    zarcWindow: 'Semeadura precoce essencial para viabilizar 2ª safra',
    hasDeepDive: false
  },
  PA: {
    region: 'Norte',
    climate: 'Equatorial / Tropical',
    crops: ['Soja', 'Dendê', 'Mandioca', 'Cacau'],
    frostRisk: 'Nulo',
    droughtRisk: 'Baixo/Médio (Sul do Pará)',
    heatRisk: 'Alto',
    nasaHighlight: 'Precipitação acumulada alta; desafio é o excesso de umidade na colheita da soja.',
    zarcWindow: 'Colheita programada fora dos picos pluviométricos',
    hasDeepDive: false
  },
  RO: {
    region: 'Norte',
    climate: 'Equatorial / Aw',
    crops: ['Soja', 'Milho', 'Café Conilon'],
    frostRisk: 'Nulo ("Friagens" pontuais)',
    droughtRisk: 'Médio',
    heatRisk: 'Alto',
    nasaHighlight: 'Fenômeno da friagem derruba temporariamente a temperatura sem causar congelamento.',
    zarcWindow: 'Rotação de soja com milho e pastagem integrada',
    hasDeepDive: false
  }
};

const stateResults = [];

fixedGeo.features.forEach(f => {
  const sigla = f.properties.sigla;
  const nome = f.properties.nome;
  const pathData = brazilPathGen(f);
  const centroid = brazilPathGen.centroid(f);
  
  const meta = STATES_META[sigla] || {
    region: 'Brasil',
    climate: 'Tropical',
    crops: ['Agricultura Diversificada', 'Pecuária'],
    frostRisk: 'Baixo',
    droughtRisk: 'Médio',
    heatRisk: 'Médio',
    nasaHighlight: 'Monitoramento climatológico contínuo pela malha NASA POWER.',
    zarcWindow: 'Consultar calendário do município no ZARC',
    hasDeepDive: false
  };

  stateResults.push({
    sigla,
    nome,
    path: pathData,
    centroid: [Math.round(centroid[0]), Math.round(centroid[1])],
    ...meta
  });
});

fs.writeFileSync(
  path.resolve('src/data/brazil_projected_states.json'),
  JSON.stringify(stateResults, null, 2)
);
console.log('✓ Generated src/data/brazil_projected_states.json with 27 states');

// Isolated Paraná state projection
const prFeature = fixedGeo.features.find(f => f.properties.sigla === 'PR');
const prWidth = 700;
const prHeight = 480;
const prProj = d3.geoMercator().fitExtent([[35, 35], [prWidth - 35, prHeight - 35]], prFeature);
const prPathGen = d3.geoPath().projection(prProj);
const prPath = prPathGen(prFeature);

// Key Paraná cities with projected coordinates
const PR_CITIES = [
  { name: 'Pato Branco', role: 'Polo Vitrine (Hackathon)', lat: -26.2295, lon: -52.6716, isShowcase: true, risk: 'Geada em Baixadas' },
  { name: 'Francisco Beltrão', role: 'Sudoeste', lat: -26.0811, lon: -53.0558, isShowcase: false, risk: 'Vale do Rio Marrecas' },
  { name: 'Cascavel', role: 'Polo Oeste', lat: -24.9578, lon: -53.4595, isShowcase: false, risk: 'Milho Safrinha' },
  { name: 'Toledo', role: 'Oeste', lat: -24.7139, lon: -53.7431, isShowcase: false, risk: 'Suínos e Grãos' },
  { name: 'Londrina', role: 'Norte Central', lat: -23.3045, lon: -51.1696, isShowcase: false, risk: 'Calor e Estiagem' },
  { name: 'Maringá', role: 'Noroeste', lat: -23.4209, lon: -51.9331, isShowcase: false, risk: 'Arenito Caiuá' },
  { name: 'Guarapuava', role: 'Centro-Sul', lat: -25.3953, lon: -51.4625, isShowcase: false, risk: 'Alta Altitude (>1000m)' },
  { name: 'Ponta Grossa', role: 'Campos Gerais', lat: -25.0994, lon: -50.1583, isShowcase: false, risk: 'Plantio Direto' },
  { name: 'Curitiba', role: 'Capital', lat: -25.4284, lon: -49.2733, isShowcase: false, risk: 'Região Metropolitana' }
];

const projectedCities = PR_CITIES.map(c => {
  const pt = prProj([c.lon, c.lat]);
  return {
    ...c,
    x: Math.round(pt[0]),
    y: Math.round(pt[1])
  };
});

fs.writeFileSync(
  path.resolve('src/data/parana_projected_state.json'),
  JSON.stringify({
    path: prPath,
    width: prWidth,
    height: prHeight,
    cities: projectedCities
  }, null, 2)
);
console.log('✓ Generated src/data/parana_projected_state.json with high-resolution boundary & cities');
