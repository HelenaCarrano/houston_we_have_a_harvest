# weharvest 🛰️🌱 — Houston, We Have a Harvest

**NASA Space Apps Challenge 2026 · Desafio _Field Shift: Adapting Farms with NASA Data_**

🔗 **App:** https://houston-we-have-a-harvest.vercel.app

[Português](#português) · [English](#english)

---

## Português

> **Idioma do app:** inglês por padrão (exigência do NASA Space Apps) e português com um clique no botão **EN | PT** do topo. Todas as telas, regras e mensagens existem nos dois idiomas.

### O que é

No Sul do Brasil a mesma terra tem duas safras por ano: soja no verão e milho safrinha logo depois. **A data de plantio da soja define quando o milho safrinha floresce** e, portanto, o risco de geada e de seca nessa fase.

O weharvest responde:

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
| **NOAA CPC · RONI** (Relative Oceanic Niño Index) e ONI antigo (ERSST v5) | Fase do El Niño / La Niña de cada safra (filtro "anos parecidos"); o ONI antigo fica no arquivo só para comparação | https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/ · https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt |
| **NASA SRTM 30 m** (SRTM v3, via OpenTopoData, dataset `srtm30m`) | Altitude do ponto de cada município e desnível do entorno (1,5 km) | https://www.opentopodata.org/datasets/srtm/ |
| **Open-Meteo** (previsão, CC BY 4.0, uso não comercial) | Previsão de 16 dias (mínima, máxima e chuva) para a checagem "posso plantar agora?" | https://open-meteo.com/ |
| **ZARC (MAPA)** | Referência para janelas de semeadura (ainda não integrado ao app) | https://dados.agricultura.gov.br/dataset/6d3d141c-885e-41a4-ab7f-dc8ff323b96f |

Os dados ficam em `src/data/power_daily_<id>.json` (arrays por parâmetro + data inicial, com a URL usada e a data do download). O app não depende da API ao vivo.

### Como os riscos são calculados

Regras do documento do time **"GroundTruth — Metodologia e validação"**. Código em `src/lib/engine/` (funções puras, com testes); parâmetros em `src/lib/engine/params.ts`.

1. **Cronograma:** colheita da soja = plantio + 120 dias; plantio do milho = colheita + 5 dias; **fase crítica do milho** (pendoamento e enchimento de grãos) = 55 a 100 dias após o plantio do milho.
2. **Geada provável:** um ano conta se a mínima do ar a 2 m (T2M_MIN) ficou **≤ 3 °C** em algum dia da fase crítica. **Geada forte:** ≤ 1 °C. Por que 3 °C: a diferença entre abrigo e relva é de 3–6 °C; 3 °C no abrigo ≈ −1 °C na relva ([Embrapa Trigo](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1084446/1/ID442832017CBAGRO20MM398.pdf), [Embrapa, boletim agroclimático](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1139138/1/BolAgroClimatico-dez21.pdf), [Semina/UEL](https://ojs.uel.br/revistas/uel/index.php/semagrarias/article/download/30322/24555/166627)).
3. **Seca:** um ano conta quando, na fase crítica, vale **um dos dois** sinais: veranico de **15+ dias seguidos com chuva < 1 mm** **ou** umidade média do solo na raiz (GWETROOT) **abaixo do percentil 20** da própria série para as mesmas datas do ano. A tela mostra os dois sinais separados e os anos com **os dois juntos** (casos mais graves). **Desvio da Metodologia:** o documento pedia "e"; trocamos por "ou" porque a regra "e" não marcou a estiagem de 2026 registrada pelo Deral. Como o sinal de solo é relativo, cerca de 1 em cada 5 anos sempre aparece como solo seco; a regra deve ser calibrada com o teste do IBGE PAM.
4. **Baixada:** o limite de geada sobe **+1 °C** (de 3 para 4 °C), porque baixadas acumulam ar frio. Hipótese a calibrar. O relevo SRTM (altitude do ponto e desnível num raio de 1,5 km) é mostrado na tela, mas ainda não classifica cada talhão como baixada.
5. **Frequência:** anos com evento ÷ anos avaliados, mostrada como "X/10 anos" e "N de 45 safras". **Nível:** Baixo (até 1 em 10), Médio (2 ou 3), Alto (4 ou mais).
6. **Confiança:** alta (≥ 12 anos), média (7–11), baixa (< 7). A Metodologia também pede concordância com Deral/IBGE para "alta"; essa validação ainda não está no app.
7. **Rotações:** cada rotação mostra níveis por critério (geada, seca, erosão), sem nota única escondida. O painel **Seu campo** pergunta o que pesa mais (renda, proteger solo e água, equilíbrio) e o que o agricultor não consegue fazer (trigo, braquiária, pouca água). Isso muda só a **ordem** e as etiquetas, por uma soma qualitativa de 1 a 3; a rotação inaplicável vai para o fim com o motivo, sem sumir. Há um botão para copiar o resumo. **Trigo:** o risco de **geada no espigamento** (70–110 dias após a semeadura em 15/05, isto é, 24/jul a 02/set) é calculado com a mesma série da NASA POWER e os mesmos limites do milho; vale para qualquer data da soja. A tela mostra também o resultado para semeadura em 30/04, 30/05 e 15/06, porque ele depende muito dessa hipótese (em Pato Branco: 36, 33, 30 e 19 de 46 safras). A seca do trigo e o filtro de El Niño **não** são aplicados ao trigo.

### Teste com 2026 (Pato Branco, soja em 20/10)

- **Geada na fase crítica em 2026: sim** (também com o limite de baixada), coerente com o Deral de maio/2026.
- **Seca na fase crítica em 2026:** o POWER mostra o 5º abril com solo mais seco desde 1981, mas sem veranico de 15 dias. Pela regra original "veranico **e** solo seco" o app dizia "não", contra o relato de estiagem do Deral; com "veranico **ou** solo seco" o ano é marcado. A tela mostra os sinais separados para que o técnico veja o que sustenta o número.

### Anos de El Niño / La Niña ("anos parecidos")

O usuário escolhe **Todos / El Niño / La Niña / Neutro** e a tela recalcula geada, seca, recomendação, gráfico e rotações usando só os anos daquela fase. O app **não adivinha** a fase da próxima safra: mostra apenas o último valor publicado pela NOAA (informativo) e o link da previsão sazonal.

- **Índice:** **RONI** da NOAA. A página do ONI citada na Metodologia (ERSST v5) avisa que mudou e que o RONI é o índice usado hoje no monitoramento oficial do ENSO (NWS Public Information Statement 26-05). O ONI antigo é baixado junto (`scripts/fetch_enso.mjs`, `src/data/enso.json`) só para comparação: ele classificaria **cerca de 15%** dos trimestres de abril a agosto (1982–2026) de outra forma, inclusive 2026 (ONI: El Niño; RONI: neutro por 0,01).
- **Fase de cada safra:** trimestre de 3 meses centrado no **meio da fase crítica do milho** para aquela data de plantio (ex.: soja em 20/10 → fase de 18/04 a 02/06 → trimestre AMJ). **El Niño** se o índice ≥ +0,5; **La Niña** se ≤ −0,5; **Neutro** entre os dois.
- **Simplificação:** a NOAA só declara um episódio com 5 trimestres seguidos acima do limite; aqui classificamos o trimestre que cobre a fase crítica. É a regra da Metodologia do time.
- **Limites de seca:** o percentil 20 de umidade do solo continua calculado com **todos** os anos; o filtro só conta quantos anos da fase tiveram o evento.
- **Amostra:** cada fase tem de 8 a 25 anos conforme a data. Abaixo de 12 anos a tela avisa para ler com cautela, e a confiança cai (alta ≥ 12, média 7–11, baixa < 7).
- **O que os dados mostram (Pato Branco, soja em 20/10):** geada em 3 de 8 anos de El Niño, 6 de 12 de La Niña e 10 de 25 neutros (19 de 45 no total). A diferença entre as fases é pequena frente à incerteza de amostras tão curtas; **não há um sinal forte de El Niño/La Niña aqui**, e o app não finge que há.

### Campo descoberto ao longo do ano

Para cada rotação e data de plantio o app monta a linha de 365 dias da soja até a próxima soja (`src/lib/engine/calendario.ts`, com testes) e mostra quando o campo fica **sem cultura** (só palha), com cobertura viva (braquiária) ou com cultura.

- **Hipóteses de ciclo (a validar com agronomia/ZARC):** soja 120 dias, intervalo de 5 dias, milho 135 dias, trigo semeado em 15/05 com 130 dias de ciclo. Os ciclos são fixos, então os **dias sem cultura são os mesmos para qualquer data da soja** (110 no milho, 115 no trigo, 5 na braquiária); o que muda é **em quais meses** eles caem.
- **Chuva nesses dias:** média de chuva e de dias com 50 mm ou mais, calculadas dos dados diários do NASA POWER (1981–2025) só nos dias sem cultura. É a média de uma grade de ~50 km e subestima temporais locais.
- **Nível de erosão** (regra da Metodologia do time), agora calculado pelos dias sem cultura: mais de 60 = **Alto**; até 15 = **Baixo** (tolerância nossa, equivale ao intervalo de semeadura); entre os dois = **Médio**. Não considera o declive do terreno (o SRTM ainda não classifica talhões) nem o mês da chuva. Isso substituiu os rótulos de erosão escritos à mão.
- **Trigo e a soja seguinte:** com a semeadura de exemplo em 15/05, a colheita do trigo passa da data de plantio da soja seguinte quando a soja é plantada até ~29/09 (em 20/09, 2 dias); a tela avisa.
- **O que os dados mostram (Pato Branco, soja em 20/10):** soja → milho fica 110 dias sem cultura, de julho a outubro, com ~524 mm de chuva média e ~0,9 dia por ano com 50 mm ou mais; a braquiária mantém o solo coberto o ano todo, exceto 5 dias.

### Checagem de 16 dias antes de plantar

O app lê a previsão de 16 dias da Open-Meteo no navegador (só as coordenadas públicas do município são enviadas; se o serviço falhar, a página continua funcionando). Regras em `src/lib/engine/previsao.ts`, com testes: mínima do ar ≤ 3 °C (4 °C em baixada) ou chuva ≥ 50 mm nos próximos 7 dias = **"Não plante esta semana"**; menos de 10 mm de chuva em 7 dias, ou os mesmos eventos depois da primeira semana = **atenção**. São **hipóteses a validar com agronomia**; previsão não é garantia e a incerteza cresce depois de ~7 dias.

### Hipóteses e o que é estimado

- Ciclos (soja 120, intervalo 5, milho 135 e trigo 130 dias, semeadura do trigo em 15/05), fase crítica (55–100 dias), limites de geada (3 °C e 1 °C), ajuste de baixada (+1 °C) e critérios de seca são **hipóteses de partida a validar com agronomia/ZARC**.
- **Trigo, fase sensível:** a literatura aponta que o dano grave da geada no trigo vem do emborrachamento ao florescimento, com mínimas na planta em torno de 0 °C a −2 °C ([Revista Cultivar](https://revistacultivar.com.br/noticias/como-ocorrem-os-danos-por-geada-no-trigo); [GRDC](https://grdc.com.au/resources-and-publications/grdc-update-papers/tab-content/grdc-update-papers/2015/02/preliminary-rating-of-wheat-varieties-for-susceptibility-to-reproductive-frost-damage)). A janela de 70–110 dias após a semeadura e o limite de 3 °C no abrigo são **hipóteses** a validar com a Embrapa Trigo/ZARC. O relato do Deral de maio 2026 sobre o trigo é de lavoura ainda vegetativa e não testa essa janela.
- Quanto cada rotação atende às prioridades são **qualitativos** (marcados "a validar com técnico"). O nível de erosão é **calculado** pelos dias sem cultura (ciclos de exemplo) e ignora o declive.
- O relevo vem de `scripts/fetch_srtm_relief.mjs` (altitude do ponto e 49 pontos a cada 500 m ao redor). Se o serviço falhar, o script usa a altitude média da célula do POWER e a tela marca o valor como **estimado**. A temperatura do POWER não recebe correção de altitude.

### Limitações

- O NASA POWER é uma **grade de ~50 km**: não representa o microclima de uma lavoura.
- A temperatura é a **do ar a 2 m**, não da superfície. Geadas na relva/folha acontecem com o ar a 2 m acima de 0 °C; por isso o limite de 3 °C.
- Os ciclos das culturas são **exemplos**; cultivar, manejo e região mudam tudo.
- **Não é previsão do tempo.** É frequência histórica.
- A classificação de El Niño/La Niña usa a tabela oficial da NOAA (a tabela antiga digitada à mão foi removida), mas é uma regra simplificada e as amostras por fase são curtas.

### Tecnologia

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · testes com `node:test` · deploy no Vercel (sem chaves secretas no código).

---

## English

> **App language:** English by default (required by NASA Space Apps) and Portuguese with one click on the **EN | PT** switch at the top. Every screen, rule and message exists in both languages.

### What it is

In southern Brazil the same field yields two crops a year: soybean in summer, then _safrinha_ (second-season) corn. **The soybean sowing date sets when the corn flowers**, and therefore its frost and drought risk.

weharvest answers:

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

Rules follow the team's methodology document. Soybean harvest = sowing + 120 d; corn sowing = harvest + 5 d; **corn critical stage** (tasseling and grain fill) = 55–100 d after corn sowing. **Likely frost:** 2 m air minimum ≤ 3 °C on any day of the critical stage (**strong frost** ≤ 1 °C); 3 °C at screen height ≈ −1 °C at grass level (Embrapa; Semina/UEL). **Drought:** within the critical stage, a dry spell of 15+ days with rain < 1 mm **or** mean root-zone soil wetness (GWETROOT) below the 20th percentile for the same calendar dates (shown separately, plus years with both). We deviate from the original methodology ("and") because it missed the documented 2026 drought. **Lowland:** frost threshold +1 °C (hypothesis to calibrate). Frequency = event years ÷ evaluated years; level Low (≤ 1 in 10), Medium (2–3), High (≥ 4). Confidence: high (≥ 12 years), medium (7–11), low (< 7). **El Niño / La Niña filter:** the user can restrict the count to seasons of one ENSO phase (NOAA's RONI, the official ENSO index: ≥ +0.5 El Niño, ≤ −0.5 La Niña, taken in the 3-month season at the middle of the critical stage); the app never guesses the coming phase. Samples are short (8–25 seasons) and the signal at this location is weak. 2026 backtest (Pato Branco, soy sown Oct 20): frost flagged, matching field reports; drought not flagged by the strict rule.

### Limitations

~50 km grid; 2 m air temperature, not surface temperature; crop-cycle parameters are example values to be validated with agronomists and Brazil's ZARC zoning; historical frequency, **not a weather forecast**; income/soil scores and wheat risk are qualitative.
