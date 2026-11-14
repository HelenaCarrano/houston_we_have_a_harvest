# GroundTruth 🛰️🌱 — Houston, We Have a Harvest

**NASA Space Apps Challenge 2026 · Desafio _Field Shift: Adapting Farms with NASA Data_**

🔗 **App:** https://houston-we-have-a-harvest.vercel.app

[Português](#português) · [English](#english)

---

## Português

### O que é

No Sul do Brasil a mesma terra tem duas safras por ano: soja no verão e milho safrinha logo depois. **A data de plantio da soja define quando o milho safrinha floresce** e, portanto, o risco de geada e de seca nessa fase.

O GroundTruth responde:

> _"Se eu plantar a soja nesta data, em quantos dos últimos ~45 anos o milho safrinha teria pegado geada ou seca na fase crítica?"_

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
| **NASA POWER Daily API** (community=AG) | T2M_MIN, T2M_MAX, PRECTOTCORR, GWETROOT, GWETTOP diários, 01/01/1981 até o último dia disponível, para Pato Branco (-26.2295, -52.6716), Cascavel (-24.9578, -53.4595) e Francisco Beltrão (-26.0811, -53.0558) | https://power.larc.nasa.gov/docs/services/api/temporal/daily/ |
| **Deral / Revista Cultivar, 9 abr 2026** | Estiagem e calor afetam feijão e milho (card "Prova 2026") | https://revistacultivar.com.br/noticias/pr-safra-2025-26-estiagem-e-calor-afetam-feijao-e-milho |
| **Deral / Revista Cultivar, 19 mai 2026** | Geadas: milho safrinha em baixadas com queima de folhas; feijão 2ª safra com perdas; trigo sem dano significativo | https://revistacultivar.com.br/noticias/pr-safra-2025-26-milho-e-feijao-sofrem-impacto-das-geadas |
| **ZARC (MAPA)** | Referência para janelas de semeadura (ainda não integrado ao app) | https://dados.agricultura.gov.br/dataset/6d3d141c-885e-41a4-ab7f-dc8ff323b96f |

Os dados ficam em `src/data/power_daily_<id>.json` (arrays por parâmetro + data inicial, com a URL usada e a data do download). O app não depende da API ao vivo.

### Como os riscos são calculados

Regras do documento do time **"GroundTruth — Metodologia e validação"**. Código em `src/lib/engine/` (funções puras, com testes); parâmetros em `src/lib/engine/params.ts`.

1. **Cronograma:** colheita da soja = plantio + 120 dias; plantio do milho = colheita + 5 dias; **fase crítica do milho** (pendoamento e enchimento de grãos) = 55 a 100 dias após o plantio do milho.
2. **Geada provável:** um ano conta se a mínima do ar a 2 m (T2M_MIN) ficou **≤ 3 °C** em algum dia da fase crítica. **Geada forte:** ≤ 1 °C. Por que 3 °C: a diferença entre abrigo e relva é de 3–6 °C; 3 °C no abrigo ≈ −1 °C na relva ([Embrapa Trigo](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1084446/1/ID442832017CBAGRO20MM398.pdf), [Embrapa, boletim agroclimático](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1139138/1/BolAgroClimatico-dez21.pdf), [Semina/UEL](https://ojs.uel.br/revistas/uel/index.php/semagrarias/article/download/30322/24555/166627)).
3. **Seca:** um ano conta quando, na fase crítica, vale **um dos dois** sinais: veranico de **15+ dias seguidos com chuva < 1 mm** **ou** umidade média do solo na raiz (GWETROOT) **abaixo do percentil 20** da própria série para as mesmas datas do ano. A tela mostra os dois sinais separados e os anos com **os dois juntos** (casos mais graves). **Desvio da Metodologia:** o documento pedia "e"; trocamos por "ou" porque a regra "e" não marcou a estiagem de 2026 registrada pelo Deral. Como o sinal de solo é relativo, cerca de 1 em cada 5 anos sempre aparece como solo seco; a regra deve ser calibrada com o teste do IBGE PAM.
4. **Baixada:** o limite de geada sobe **+1 °C** (de 3 para 4 °C), porque baixadas acumulam ar frio. Hipótese a calibrar; ainda sem relevo real (SRTM).
5. **Frequência:** anos com evento ÷ anos avaliados, mostrada como "X/10 anos" e "N de 45 safras". **Nível:** Baixo (até 1 em 10), Médio (2 ou 3), Alto (4 ou mais).
6. **Confiança:** alta (≥ 12 anos), média (7–11), baixa (< 7). A Metodologia também pede concordância com Deral/IBGE para "alta"; essa validação ainda não está no app.
7. **Rotações:** cada rotação mostra níveis por critério (geada, seca, erosão), sem nota única escondida. As prioridades do agricultor (água, forragem, nitrogênio, erosão, matéria orgânica, mercado) mudam só a **ordem**, por uma soma qualitativa de 1 a 3. O risco do trigo não é calculado.

### Teste com 2026 (Pato Branco, soja em 20/10)

- **Geada na fase crítica em 2026: sim** (também com o limite de baixada), coerente com o Deral de maio/2026.
- **Seca na fase crítica em 2026:** o POWER mostra o 5º abril com solo mais seco desde 1981, mas sem veranico de 15 dias. Pela regra original "veranico **e** solo seco" o app dizia "não", contra o relato de estiagem do Deral; com "veranico **ou** solo seco" o ano é marcado. A tela mostra os sinais separados para que o técnico veja o que sustenta o número.

### Hipóteses e o que é estimado

- Ciclos (120 / 5 dias), fase crítica (55–100 dias), limites de geada (3 °C e 1 °C), ajuste de baixada (+1 °C) e critérios de seca são **hipóteses de partida a validar com agronomia/ZARC**.
- Quanto cada rotação atende às prioridades, os níveis de erosão e o risco do trigo são **qualitativos** (marcados "a validar com técnico").
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

> _"If I sow soybean on this date, in how many of the last ~45 years would the second-season corn have been hit by frost or drought during its critical stage (tasseling and grain fill)?"_

It also compares three rotations (soy → corn, soy → wheat, soy → corn + _Brachiaria_ grass) according to the farmer's priorities (income, lower risk, soil). It **supports** the decisions of farmers and agronomists; it does not replace them.

### Run locally

```bash
nvm use && npm install && npm run dev   # http://localhost:3000
npm test                                # risk engine tests
npm run data:fetch                      # re-download NASA POWER daily data
```

### Data sources

- **NASA POWER Daily API** (community=AG): daily T2M_MIN, T2M_MAX, PRECTOTCORR, GWETROOT, GWETTOP from 1981-01-01 to the latest available day, for Pato Branco, Cascavel and Francisco Beltrão (Paraná). https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- **Deral (Paraná state agriculture department) via Revista Cultivar**, Apr and May 2026 field reports (links above), used only for the 2026 season.

### How risk is computed

Rules follow the team's methodology document. Soybean harvest = sowing + 120 d; corn sowing = harvest + 5 d; **corn critical stage** (tasseling and grain fill) = 55–100 d after corn sowing. **Likely frost:** 2 m air minimum ≤ 3 °C on any day of the critical stage (**strong frost** ≤ 1 °C); 3 °C at screen height ≈ −1 °C at grass level (Embrapa; Semina/UEL). **Drought:** within the critical stage, a dry spell of 15+ days with rain < 1 mm **or** mean root-zone soil wetness (GWETROOT) below the 20th percentile for the same calendar dates (shown separately, plus years with both). We deviate from the original methodology ("and") because it missed the documented 2026 drought. **Lowland:** frost threshold +1 °C (hypothesis to calibrate). Frequency = event years ÷ evaluated years; level Low (≤ 1 in 10), Medium (2–3), High (≥ 4). Confidence: high (≥ 12 years), medium (7–11), low (< 7). 2026 backtest (Pato Branco, soy sown Oct 20): frost flagged, matching field reports; drought not flagged by the strict rule.

### Limitations

~50 km grid; 2 m air temperature, not surface temperature; crop-cycle parameters are example values to be validated with agronomists and Brazil's ZARC zoning; historical frequency, **not a weather forecast**; income/soil scores and wheat risk are qualitative.
