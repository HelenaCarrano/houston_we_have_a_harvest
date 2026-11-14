# GroundTruth 🛰️🌱 — Houston, We Have a Harvest

**NASA Space Apps Challenge 2026 · Desafio _Field Shift: Adapting Farms with NASA Data_**

🔗 **App:** https://houston-we-have-a-harvest.vercel.app

[Português](#português) · [English](#english)

---

## Português

### O que é

No Sul do Brasil a mesma terra tem duas safras por ano: soja no verão e milho safrinha logo depois. **A data de plantio da soja define quando o milho safrinha floresce** e, portanto, o risco de geada e de seca nessa fase.

O GroundTruth responde:

> _"Se eu plantar a soja nesta data, em quantos dos últimos ~35 anos o milho safrinha teria pegado geada na floração ou seca no início?"_

E compara três rotações (soja → milho safrinha, soja → trigo, soja → milho + braquiária) segundo as prioridades do agricultor (renda, menos risco, solo). É uma ferramenta de **apoio à decisão**: não substitui o agricultor nem o técnico.

Caso de demonstração: Sudoeste do Paraná (Pato Branco), onde estiagem (abril/2026) e geada (maio/2026) causaram perdas relatadas pelo Deral.

### Como rodar

```bash
nvm use            # Node 24 (.nvmrc)
npm install
npm run dev        # http://localhost:3000
npm test           # testes do motor de risco
npm run data:fetch # baixa de novo os dados diários da NASA POWER e regenera o histórico
```

### Fontes de dados

| Fonte | Uso | Link |
|---|---|---|
| **NASA POWER Daily API** (community=AG) | T2M_MIN, T2M_MAX, PRECTOTCORR, GWETROOT, GWETTOP diários, 01/01/1991 até o último dia disponível, para Pato Branco (-26.2295, -52.6716), Cascavel (-24.9578, -53.4595) e Francisco Beltrão (-26.0811, -53.0558) | https://power.larc.nasa.gov/docs/services/api/temporal/daily/ |
| **Deral / Revista Cultivar, 9 abr 2026** | Estiagem e calor afetam feijão e milho (card "Prova 2026") | https://revistacultivar.com.br/noticias/pr-safra-2025-26-estiagem-e-calor-afetam-feijao-e-milho |
| **Deral / Revista Cultivar, 19 mai 2026** | Geadas: milho safrinha em baixadas com queima de folhas; feijão 2ª safra com perdas; trigo sem dano significativo | https://revistacultivar.com.br/noticias/pr-safra-2025-26-milho-e-feijao-sofrem-impacto-das-geadas |
| **ZARC (MAPA)** | Referência para janelas de semeadura (ainda não integrado ao app) | https://dados.agricultura.gov.br/dataset/6d3d141c-885e-41a4-ab7f-dc8ff323b96f |

Os dados ficam em `src/data/power_daily_<id>.json` (arrays por parâmetro + data inicial, com a URL usada e a data do download). O app não depende da API ao vivo.

### Como os riscos são calculados

Código em `src/lib/engine/` (funções puras, com testes). Parâmetros em `src/lib/engine/params.ts`.

1. **Cronograma:** colheita da soja = plantio + 120 dias; plantio do milho = colheita + 5 dias; floração = plantio do milho + 65 dias.
2. **Geada na floração:** um ano conta se a temperatura mínima do ar a 2 m (T2M_MIN) ficou **≤ 3 °C** em algum dia de [floração − 10, floração + 10].
3. **Seca no início do milho:** nos 30 dias após o plantio do milho, um ano conta se houve **15+ dias seguidos com chuva < 1 mm** ou se a umidade média do solo na raiz (GWETROOT) ficou **abaixo do percentil 20** do município (limite único para todas as datas, para que as datas sejam comparáveis).
4. **Frequência:** anos com evento ÷ anos avaliados, mostrada como "X de cada 10 anos" e "N de 35 safras".
5. **Confiança:** alta (≥ 25 anos), média (12–24), baixa (< 12).
6. **Baixada:** só um aviso qualitativo ("baixadas acumulam ar frio; o risco local tende a ser maior"), sem multiplicar números sem base.
7. **Rotações:** notas de 1 a 3 em renda, risco climático e solo; a prioridade escolhida tem peso 2. O risco do milho vem do cálculo; renda, solo e o risco do trigo são **qualitativos** e estão marcados na tela.

### Valores de exemplo e o que é estimado

- Ciclos (120 / 5 / 65 dias), limite de geada (3 °C), janela (±10 dias) e critérios de seca são **valores de exemplo a validar com agronomia/ZARC**.
- As notas de renda e solo das rotações e o risco do trigo são **qualitativos** (marcados "a validar com técnico").
- O histórico anual em `src/data/historical_events_40years.json` é **calculado** dos dados diários (`scripts/build_historical_events.mjs`). Não há listas de "anos conhecidos" nem valores inventados. Perdas do Deral só aparecem para 2026.
- `scripts/fetch_nasa_data.mjs` (climatologia mensal) tem altitudes fixas no código que **não foram conferidas** com o SRTM; elas não são usadas na tela principal.

### Limitações

- O NASA POWER é uma **grade de ~50 km**: não representa o microclima de uma lavoura.
- A temperatura é a **do ar a 2 m**, não da superfície. Geadas na relva/folha acontecem com o ar a 2 m acima de 0 °C; por isso o limite de 3 °C.
- Os ciclos das culturas são **exemplos**; cultivar, manejo e região mudam tudo.
- **Não é previsão do tempo.** É frequência histórica.
- El Niño/La Niña ainda não é usado (a tabela antiga digitada à mão foi removida).

### Tecnologia

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · testes com `node:test` · deploy no Vercel (sem chaves secretas no código).

---

## English

### What it is

In southern Brazil the same field yields two crops a year: soybean in summer, then _safrinha_ (second-season) corn. **The soybean sowing date sets when the corn flowers**, and therefore its frost and drought risk.

GroundTruth answers:

> _"If I sow soybean on this date, in how many of the last ~35 years would the second-season corn have been hit by frost at flowering or by drought at establishment?"_

It also compares three rotations (soy → corn, soy → wheat, soy → corn + _Brachiaria_ grass) according to the farmer's priorities (income, lower risk, soil). It **supports** the decisions of farmers and agronomists; it does not replace them.

### Run locally

```bash
nvm use && npm install && npm run dev   # http://localhost:3000
npm test                                # risk engine tests
npm run data:fetch                      # re-download NASA POWER daily data
```

### Data sources

- **NASA POWER Daily API** (community=AG): daily T2M_MIN, T2M_MAX, PRECTOTCORR, GWETROOT, GWETTOP from 1991-01-01 to the latest available day, for Pato Branco, Cascavel and Francisco Beltrão (Paraná). https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- **Deral (Paraná state agriculture department) via Revista Cultivar**, Apr and May 2026 field reports (links above), used only for the 2026 season.

### How risk is computed

Soybean harvest = sowing + 120 d; corn sowing = harvest + 5 d; corn flowering = corn sowing + 65 d. **Frost year:** 2 m air minimum temperature ≤ 3 °C on any day within flowering ± 10 d. **Drought year:** within 30 d after corn sowing, a run of 15+ days with rain < 1 mm, or mean root-zone soil wetness (GWETROOT) below the location's 20th percentile. Frequency = event years ÷ evaluated years. Confidence: high (≥ 25 years), medium (12–24), low (< 12).

### Limitations

~50 km grid; 2 m air temperature, not surface temperature; crop-cycle parameters are example values to be validated with agronomists and Brazil's ZARC zoning; historical frequency, **not a weather forecast**; income/soil scores and wheat risk are qualitative.
