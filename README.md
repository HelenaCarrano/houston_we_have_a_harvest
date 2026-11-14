# GroundTruth 🛰️🌱
> **NASA Space Apps Challenge 2026** · Desafio: *Field Shift: Adapting Farms with NASA Data*

O **GroundTruth** cruza 40 anos de satélites da NASA com o relevo (SRTM 30m) e o solo de cada fazenda para orientar técnicos e agricultores sobre **o que plantar, onde na propriedade e quando**, gerando um Plano de Safra objetivo para envio no WhatsApp.

---

## 🧭 Estrutura da Aplicação (Navegação Drill-Down)

1. **Nível 1 — Visão Brasil:** Mapa interativo nacional destacando os estados agrícolas e suas vulnerabilidades climáticas.
2. **Nível 2 — Mesorregiões do Paraná:** Subdivisão regional (Sudoeste, Oeste, Centro-Sul, etc.) mostrando o impacto real de geadas e secas validadas com os boletins do DERAL (safra 2025/26).
3. **Nível 3 — Fazenda & Talhões (NASA SRTM):** Modelo de elevação digital (30m) que separa as **baixadas frias (< 680m)** das **encostas e topos (> 720m)**.
4. **Comparador das 3 Estratégias (Requisito NASA):**
   - *Opção 1 (Atual):* Soja ➔ Milho Safrinha Solteiro.
   - *Opção 2 (Adaptação Térmica):* Soja ➔ Trigo (imune a geadas nas baixadas).
   - *Opção 3 (Solo e Resiliência Hídrica):* Soja ➔ Milho + Braquiária consorciada (para encostas e topos).
5. **Plano de Safra em 1 Página:** Resumo em formato A4/modal pronto para impressão ou compartilhamento via WhatsApp com o agricultor.

---

## 📡 Fontes de Dados Oficiais da NASA

- **NASA POWER (Agroclimatology API):**
  - Temperaturas Mínimas (`T2M_MIN`) e Máximas (`T2M_MAX`) diárias e mensais (1981-2025).
  - Precipitação diária corrigida (`PRECTOTCORR`).
  - Umidade do solo na raiz (`GWETROOT`) e na superfície (`GWETTOP`).
- **NASA SRTM (Shuttle Radar Topography Mission):** Elevação de 30 metros para detecção de drenagem catabática e lagos de ar frio em baixadas.
- **NOAA CPC:** Classificação histórica do índice ONI (El Niño, La Niña e Neutro).
- **MAPA / ZARC:** Zoneamento Agrícola de Risco Climático e janelas oficiais de semeadura.
- **DERAL / IDR-Paraná:** Validação de perdas reais de campo da safra 2025/26.

---

## 🛠️ Tecnologias

- **Next.js 16** (App Router & Turbopack)
- **React 19 & TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui & Lucide Icons**
- **Recharts** (Gráficos climáticos interativos)
- **NVM** (Node.js v24 via `.nvmrc`)

---

## 🚀 Como Executar

```bash
# 1. Carregar o Node correto
nvm use

# 2. Instalar dependências
npm install

# 3. Executar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔄 Como Atualizar os Dados da NASA Localmente

O projeto possui um script dedicado para extrair e recalibrar dados da NASA POWER:

```bash
node scripts/fetch_nasa_data.mjs
```
Os dados serão salvos em `src/data/nasa_locations_climatology.json` e `src/data/historical_events_40years.json`.
