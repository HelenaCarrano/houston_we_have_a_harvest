// src/data/regions_data.ts
// Geographic and agricultural data for Brazil states and Paraná mesoregions

export interface RegionInfo {
  id: string;
  name: string;
  code: string;
  capital?: string;
  hasDetailedData: boolean;
  climateZone: string;
  mainCrops: string[];
  climateRiskSummary: string;
}

export const BRAZIL_STATES: RegionInfo[] = [
  {
    id: 'PR',
    name: 'Paraná',
    code: 'PR',
    capital: 'Curitiba',
    hasDetailedData: true,
    climateZone: 'Subtropical Cfb/Cfa (Vulnerável a geadas de massas polares)',
    mainCrops: ['Soja', 'Milho Safrinha', 'Trigo', 'Feijão'],
    climateRiskSummary: 'Geada em baixadas entre maio e julho; estiagens frequentes no início do outono em anos de La Niña.'
  },
  {
    id: 'RS',
    name: 'Rio Grande do Sul',
    code: 'RS',
    capital: 'Porto Alegre',
    hasDetailedData: false,
    climateZone: 'Subtropical Cfa/Cfb',
    mainCrops: ['Soja', 'Arroz', 'Trigo'],
    climateRiskSummary: 'Extremos hídricos (estiagens prolongadas em La Niña e enchentes em El Niño).'
  },
  {
    id: 'SC',
    name: 'Santa Catarina',
    code: 'SC',
    capital: 'Florianópolis',
    hasDetailedData: false,
    climateZone: 'Subtropical Cfb',
    mainCrops: ['Milho', 'Soja', 'Maçã'],
    climateRiskSummary: 'Geadas precoces e tardias na serra; granizo isolado.'
  },
  {
    id: 'MT',
    name: 'Mato Grosso',
    code: 'MT',
    capital: 'Cuiabá',
    hasDetailedData: false,
    climateZone: 'Tropical com estação seca (Aw)',
    mainCrops: ['Soja', 'Milho Safrinha', 'Algodão'],
    climateRiskSummary: 'Janela de chuva curta; fechamento antecipado das chuvas em abril.'
  },
  {
    id: 'MS',
    name: 'Mato Grosso do Sul',
    code: 'MS',
    capital: 'Campo Grande',
    hasDetailedData: false,
    climateZone: 'Tropical / Subtropical',
    mainCrops: ['Soja', 'Milho Safrinha'],
    climateRiskSummary: 'Ondas de frio pontuais ao sul e veranicos de outono.'
  },
  {
    id: 'GO',
    name: 'Goiás',
    code: 'GO',
    capital: 'Goiânia',
    hasDetailedData: false,
    climateZone: 'Tropical (Aw)',
    mainCrops: ['Soja', 'Milho', 'Sorgo'],
    climateRiskSummary: 'Veranicos no verão e seca pronunciada no inverno.'
  },
  {
    id: 'SP',
    name: 'São Paulo',
    code: 'SP',
    capital: 'São Paulo',
    hasDetailedData: false,
    climateZone: 'Tropical de altitude (Cwa)',
    mainCrops: ['Cana-de-açúcar', 'Soja', 'Citros'],
    climateRiskSummary: 'Geadas fracas no sul do estado e veranicos no noroeste.'
  },
  {
    id: 'MG',
    name: 'Minas Gerais',
    code: 'MG',
    capital: 'Belo Horizonte',
    hasDetailedData: false,
    climateZone: 'Tropical de altitude',
    mainCrops: ['Café', 'Milho', 'Soja'],
    climateRiskSummary: 'Estresse hídrico e altas temperaturas na floração do café.'
  },
  {
    id: 'BA',
    name: 'Bahia',
    code: 'BA',
    capital: 'Salvador',
    hasDetailedData: false,
    climateZone: 'Semiárido e Tropical (Matopiba)',
    mainCrops: ['Soja', 'Algodão', 'Milho'],
    climateRiskSummary: 'Irregularidade de chuvas no oeste baiano.'
  }
];

export interface ParanaMesoregion {
  id: string;
  name: string;
  centerCity: string;
  lat: number;
  lon: number;
  avgElevation: number;
  reliefType: string;
  frostRisk: 'Alto' | 'Médio' | 'Baixo';
  droughtRisk: 'Alto' | 'Médio' | 'Baixo';
  frostHistoryStat: string; // Ex: "3 de cada 10 anos"
  droughtHistoryStat: string;
  featuredFarmsCount: number;
  summary: string;
  sampleFarmId: string;
}

export const PARANA_MESOREGIONS: ParanaMesoregion[] = [
  {
    id: 'sudoeste',
    name: 'Sudoeste Paranaense',
    centerCity: 'Pato Branco / Fco. Beltrão',
    lat: -26.2295,
    lon: -52.6716,
    avgElevation: 720,
    reliefType: 'Ondulado a montanhoso com vales profundos',
    frostRisk: 'Alto',
    droughtRisk: 'Médio',
    frostHistoryStat: '3 de cada 10 anos (geada severa em baixadas)',
    droughtHistoryStat: '2 de cada 10 anos (estiagem em abril)',
    featuredFarmsCount: 12,
    summary: 'Área com vales encaixados onde ocorre forte inversão térmica. Em 2026, a geada destruiu o milho nas baixadas, enquanto o trigo escapou ileso.',
    sampleFarmId: 'fazenda-santa-maria'
  },
  {
    id: 'oeste',
    name: 'Oeste Paranaense',
    centerCity: 'Cascavel / Toledo',
    lat: -24.9578,
    lon: -53.4595,
    avgElevation: 740,
    reliefType: 'Suave ondulado com solos muito profundos (Latossolos)',
    frostRisk: 'Médio',
    droughtRisk: 'Médio',
    frostHistoryStat: '2 de cada 10 anos',
    droughtHistoryStat: '3 de cada 10 anos (veranicos em abril)',
    featuredFarmsCount: 18,
    summary: 'Coração do milho safrinha paranaense. Maior desafio é a janela de semeadura rápida após a colheita da soja.',
    sampleFarmId: 'fazenda-horizonte-verde'
  },
  {
    id: 'centro-sul',
    name: 'Centro-Sul Paranaense',
    centerCity: 'Guarapuava',
    lat: -25.3953,
    lon: -51.4625,
    avgElevation: 1050,
    reliefType: 'Planalto de alta altitude, frio rigoroso',
    frostRisk: 'Alto',
    droughtRisk: 'Baixo',
    frostHistoryStat: '5 de cada 10 anos',
    droughtHistoryStat: '1 de cada 10 anos',
    featuredFarmsCount: 8,
    summary: 'Altitude acima de 1.000 m. Clima excelente para cevada e trigo, mas milho safrinha tem risco térmico extremo.',
    sampleFarmId: 'fazenda-planalto-sul'
  },
  {
    id: 'norte-central',
    name: 'Norte Central Paranaense',
    centerCity: 'Londrina / Maringá',
    lat: -23.3045,
    lon: -51.1696,
    avgElevation: 580,
    reliefType: 'Planalto suave, terra roxa fértil',
    frostRisk: 'Baixo',
    droughtRisk: 'Alto',
    frostHistoryStat: '1 de cada 10 anos',
    droughtHistoryStat: '4 de cada 10 anos (calor e seca precoce)',
    featuredFarmsCount: 15,
    summary: 'Menor risco de geada, porém maior suscetibilidade a altas temperaturas e estiagem em abril/maio.',
    sampleFarmId: 'fazenda-terra-roxa'
  },
  {
    id: 'campos-gerais',
    name: 'Campos Gerais',
    centerCity: 'Ponta Grossa / Castro',
    lat: -25.0994,
    lon: -50.1583,
    avgElevation: 900,
    reliefType: 'Ondulado, escarpas e solos arenosos/médios',
    frostRisk: 'Médio',
    droughtRisk: 'Baixo',
    frostHistoryStat: '3 de cada 10 anos',
    droughtHistoryStat: '2 de cada 10 anos',
    featuredFarmsCount: 10,
    summary: 'Polo de tecnologia de plantio direto e alta produtividade de trigo e soja.',
    sampleFarmId: 'fazenda-campos-altos'
  }
];

export interface FarmDetails {
  id: string;
  name: string;
  owner: string;
  municipality: string;
  region: string;
  lat: number;
  lon: number;
  totalHectares: number;
  elevationMin: number;
  elevationMax: number;
  currentSystem: string;
  soilType: string;
  reliefDistribution: {
    lowlandPct: number;   // baixada (< 680m)
    slopePct: number;      // encosta (680-720m)
    plateauPct: number;    // topo/planalto (> 720m)
  };
  rotations: {
    id: string;
    title: string;
    isCurrent: boolean;
    cropSequence: string;
    frostRiskLevel: 'Alto' | 'Médio' | 'Baixo';
    frostProbabilityText: string;
    droughtRiskLevel: 'Alto' | 'Médio' | 'Baixo';
    droughtProbabilityText: string;
    soilProtectionScore: string;
    economicRiskText: string;
    optimalWindow: string;
    idealMicrozone: string;
    agronomyRecommendation: string;
    recommendationBadge: 'Não Recomendado para Baixadas' | 'Altamente Recomendado para Baixadas' | 'Recomendado para Encostas e Topos';
    badgeColor: 'destructive' | 'default' | 'secondary';
  }[];
}

export const SAMPLE_FARMS: Record<string, FarmDetails> = {
  'fazenda-santa-maria': {
    id: 'fazenda-santa-maria',
    name: 'Fazenda Santa Maria',
    owner: 'Cooperado Integrado (Exemplo DERAL)',
    municipality: 'Pato Branco (PR)',
    region: 'Sudoeste Paranaense',
    lat: -26.2295,
    lon: -52.6716,
    totalHectares: 185,
    elevationMin: 642,
    elevationMax: 765,
    currentSystem: 'Soja (Verão) → Milho Safrinha Solteiro (Outono/Inverno)',
    soilType: 'Latossolo Vermelho Distroférrico (Textura argilosa a média)',
    reliefDistribution: {
      lowlandPct: 35, // 35% em baixada fria
      slopePct: 40,   // 40% em meia-encosta
      plateauPct: 25   // 25% em topo protegido
    },
    rotations: [
      {
        id: 'opcao-1-atual',
        title: 'Opção 1 (Atual): Soja → Milho Safrinha Solteiro',
        isCurrent: true,
        cropSequence: 'Soja precoce (plantio out) → Milho safrinha (plantio fev)',
        frostRiskLevel: 'Alto',
        frostProbabilityText: '3 de cada 10 anos atinge florescimento nas baixadas (< 680 m)',
        droughtRiskLevel: 'Médio',
        droughtProbabilityText: '2 de cada 10 anos sofrem com veranico em abril (dobra em La Niña)',
        soilProtectionScore: 'Crítico: Solo descoberto por ~60 dias após a colheita',
        economicRiskText: 'Renda conhecida, mas alto risco de quebra catastrófica por geada',
        optimalWindow: 'Semear impreterivelmente até 10/02 (ZARC)',
        idealMicrozone: 'Apenas topos e encostas (> 720 m). Proibido em baixadas.',
        agronomyRecommendation: 'Se mantiver, contratar seguro paramétrico e colher mais cedo.',
        recommendationBadge: 'Não Recomendado para Baixadas',
        badgeColor: 'destructive'
      },
      {
        id: 'opcao-2-trigo',
        title: 'Opção 2 (Adaptação Térmica): Soja → Trigo de Inverno',
        isCurrent: false,
        cropSequence: 'Soja (outubro) → Trigo tolerante a baixas temperaturas (maio)',
        frostRiskLevel: 'Baixo',
        frostProbabilityText: '1 de cada 10 anos (Trigo resiste a geadas na fase vegetativa)',
        droughtRiskLevel: 'Baixo',
        droughtProbabilityText: 'Aproveita umidade do solo acumulada de outono',
        soilProtectionScore: 'Bom: Cobertura verde no inverno e controle de plantas daninhas',
        economicRiskText: 'Renda depende da cotação do trigo e qualidade de panificação (PH)',
        optimalWindow: 'Semeadura recomendada entre 15/04 e 20/05 conforme ZARC',
        idealMicrozone: 'Ideal para as baixadas da fazenda (642 m - 680 m)',
        agronomyRecommendation: 'Confirmar com agrônomo cultivar de ciclo médio e controle de giberela.',
        recommendationBadge: 'Altamente Recomendado para Baixadas',
        badgeColor: 'default'
      },
      {
        id: 'opcao-3-consorcio',
        title: 'Opção 3 (Solo e Resiliência): Soja → Milho + Braquiária',
        isCurrent: false,
        cropSequence: 'Soja → Milho Safrinha consorciado com Brachiaria ruziziensis',
        frostRiskLevel: 'Médio',
        frostProbabilityText: '2 de cada 10 anos nas partes médias/altas',
        droughtRiskLevel: 'Baixo',
        droughtProbabilityText: 'Palhada profunda retém água no solo por 14 dias a mais',
        soilProtectionScore: 'Excelente: Solo 100% coberto o ano todo, bioporos e retenção hídrica',
        economicRiskText: 'Renda do grão de milho + forragem/palhada para a próxima soja (+8 sc/ha)',
        optimalWindow: 'Semear simultaneamente até 10/02',
        idealMicrozone: 'Partes altas e encostas (680 m a 765 m)',
        agronomyRecommendation: 'Ajustar dessecação e dose de herbicida graminicida pós-colheita.',
        recommendationBadge: 'Recomendado para Encostas e Topos',
        badgeColor: 'secondary'
      }
    ]
  }
};
