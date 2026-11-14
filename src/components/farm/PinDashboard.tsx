"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PinData } from "@/components/map/PinLocationModal";
import {
  MapPin,
  Mountain,
  ThermometerSnowflake,
  Droplets,
  Satellite,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  BarChart2,
  X,
  Info,
  Zap,
  Database,
} from "lucide-react";

interface PinDashboardProps {
  pin: PinData;
  historicalEvents: Array<{
    year: number;
    enso: string;
    frostDaysCritical: number;
    lowestTempCelsius: number;
    aprilRainMm: number;
    hasSevereFrost: boolean;
    hasSevereDrought: boolean;
    cropLossReportedDeral: string;
    safrinhaCornStatus: string;
  }>;
  onClose: () => void;
}

// FAO crop water requirements (mm/month) for selected crops in subtropical climate
const CROP_WATER_NEEDS: Record<string, number[]> = {
  soja: [0, 0, 0, 0, 0, 0, 0, 0, 0, 120, 150, 160], // planted Oct-Mar
  milho: [0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 130, 140],
  trigo: [0, 0, 0, 60, 90, 100, 110, 100, 90, 0, 0, 0], // planted Apr-Sep
  milho_braquiaria: [0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 110, 120],
};

const CROP_LABELS: Record<string, string> = {
  soja: "Soja de Verão",
  milho: "Milho Safrinha",
  trigo: "Trigo de Inverno",
  milho_braquiaria: "Milho + Braquiária",
};

// Rotation radar data
const ROTATION_RADAR_DATA = [
  {
    subject: "Risco Geada",
    "Rotação Atual (Milho)": 70,
    "Trigo nas Baixadas": 20,
    "Milho + Braquiária": 50,
    fullMark: 100,
  },
  {
    subject: "Risco Seca",
    "Rotação Atual (Milho)": 55,
    "Trigo nas Baixadas": 30,
    "Milho + Braquiária": 35,
    fullMark: 100,
  },
  {
    subject: "Proteção Solo",
    "Rotação Atual (Milho)": 25,
    "Trigo nas Baixadas": 55,
    "Milho + Braquiária": 85,
    fullMark: 100,
  },
  {
    subject: "Renda Esperada",
    "Rotação Atual (Milho)": 60,
    "Trigo nas Baixadas": 55,
    "Milho + Braquiária": 65,
    fullMark: 100,
  },
  {
    subject: "Facilidade Manejo",
    "Rotação Atual (Milho)": 70,
    "Trigo nas Baixadas": 60,
    "Milho + Braquiária": 50,
    fullMark: 100,
  },
];

// Gantt data for crop calendar (Nov 2026 as "today")
const GANTT_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
  const label =
    score >= 70 ? "Alto Risco" : score >= 40 ? "Risco Moderado" : "Risco Baixo";

  // Circular arc using SVG
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 140 80" className="w-40 h-auto">
        {/* Background arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-700"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        {/* Score text */}
        <text
          x="70"
          y="68"
          textAnchor="middle"
          className="font-bold"
          style={{ fill: color, fontSize: "24px", fontWeight: "900" }}
        >
          {score}
        </text>
        <text
          x="70"
          y="80"
          textAnchor="middle"
          style={{ fill: "currentColor", fontSize: "9px", opacity: 0.6 }}
        >
          /100
        </text>
      </svg>
      <span
        className="text-sm font-bold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}20` }}
      >
        {label}
      </span>
    </div>
  );
}

// Custom tooltip for 40 years bar chart
function YearTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { year: number; enso: string; hasSevereFrost: boolean; hasSevereDrought: boolean; aprilRainMm: number; lowestTempCelsius: number; cropLossReportedDeral: string } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-3 text-xs max-w-[200px]">
      <p className="font-bold text-zinc-900 dark:text-white mb-1">{d.year}</p>
      <p className="text-zinc-500 mb-1">ENSO: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{d.enso}</span></p>
      {d.hasSevereFrost && <p className="text-red-600 dark:text-red-400">❄️ Geada severa detectada</p>}
      {d.hasSevereDrought && <p className="text-amber-600 dark:text-amber-400">🌵 Seca prolongada detectada</p>}
      {!d.hasSevereFrost && !d.hasSevereDrought && <p className="text-emerald-600 dark:text-emerald-400">✅ Ano sem eventos extremos</p>}
      <p className="text-zinc-400 mt-1 text-[10px]">{d.cropLossReportedDeral}</p>
    </div>
  );
}

export function PinDashboard({ pin, historicalEvents, onClose }: PinDashboardProps) {
  const [selectedCrop, setSelectedCrop] = useState<string>("soja");
  const [ensoFilter, setEnsoFilter] = useState<"all" | "La Niña" | "El Niño">("all");

  const { riskMetrics, climatology, elevationM, thermalZone } = pin;

  // 1. Chuva vs Demanda Hídrica (AreaChart)
  const rainVsDemandData = climatology.map((m, i) => ({
    month: m.monthName.slice(0, 3),
    chuva: m.totalPrecipMmMonth,
    demanda: CROP_WATER_NEEDS[selectedCrop]?.[i] ?? 0,
    deficit: Math.max(
      0,
      (CROP_WATER_NEEDS[selectedCrop]?.[i] ?? 0) - m.totalPrecipMmMonth
    ),
  }));

  // 2. 40 anos bons e ruins (BarChart colorido)
  const filteredHistory = historicalEvents.filter((e) => {
    if (ensoFilter === "all") return true;
    return e.enso === ensoFilter;
  });

  const fortyYearsData = filteredHistory.map((e) => ({
    ...e,
    score:
      e.hasSevereFrost && e.hasSevereDrought ? 1 : // Crítico
      e.hasSevereFrost || e.hasSevereDrought ? 2 :  // Risco médio
      3,                                              // Bom
    color:
      e.hasSevereFrost && e.hasSevereDrought ? "#ef4444" :
      e.hasSevereFrost || e.hasSevereDrought ? "#f59e0b" :
      "#22c55e",
  }));

  // 3. Scatter de temperatura mínima por ano (June/July)
  const tempScatterData = historicalEvents.map((e) => ({
    year: e.year,
    temp: e.lowestTempCelsius,
    enso: e.enso,
    frost: e.lowestTempCelsius <= 3,
  }));

  const laNinaScatter = tempScatterData.filter((d) => d.enso === "La Niña");
  const elNinoScatter = tempScatterData.filter((d) => d.enso === "El Niño");
  const neutroScatter = tempScatterData.filter((d) => d.enso === "Neutro");

  const thermalZoneLabel = {
    lowland: { label: "Baixada", icon: "🔴", desc: "Ar frio se acumula aqui. Risco de geada 30% maior que no topo." },
    slope: { label: "Encosta", icon: "🟡", desc: "Risco intermediário. Boa drenagem do ar frio no inverno." },
    plateau: { label: "Planalto", icon: "🟢", desc: "Melhor circulação de ar. Geada menos frequente e menos intensa." },
  }[thermalZone];

  return (
    <div className="space-y-6">
      {/* Pin Header Card */}
      <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="size-5 text-blue-200" />
              <h2 className="text-xl sm:text-2xl font-bold font-heading">{pin.name}</h2>
            </div>
            <p className="text-blue-200 text-sm mb-3">
              Lat {pin.lat.toFixed(4)}° · Lon {pin.lon.toFixed(4)}°
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-none gap-1">
                <Mountain className="size-3" /> Altitude: {elevationM}m
              </Badge>
              <Badge className="bg-white/20 text-white border-none gap-1">
                {thermalZoneLabel.icon} Zona Térmica: {thermalZoneLabel.label}
              </Badge>
              <Badge className="bg-white/20 text-white border-none gap-1">
                <Zap className="size-3" /> Próxima Safra: La Niña (NOAA)
              </Badge>
            </div>
          </div>

          {/* Vulnerability Score */}
          <div className="bg-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[160px]">
            <p className="text-xs font-semibold text-blue-200 mb-2">Risco Geral da Propriedade</p>
            <ScoreGauge score={riskMetrics.vulnerabilityScore} />
            <p className="text-[10px] text-blue-200 mt-2 text-center">
              Fonte: NASA POWER + NOAA CPC
            </p>
          </div>
        </div>

        {/* Key metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              icon: <ThermometerSnowflake className="size-4" />,
              label: "Risco de Geada (floração)",
              value: `${riskMetrics.frostProbabilityPct}% dos anos`,
              sub: `= ${Math.round(riskMetrics.frostProbabilityPct / 10)} de cada 10 anos`,
              warn: riskMetrics.frostProbabilityPct > 25,
            },
            {
              icon: <Droplets className="size-4" />,
              label: "Seca prolongada (abril)",
              value: `${riskMetrics.droughtFrequencyPct}% dos anos`,
              sub: `Dobra em La Niña`,
              warn: riskMetrics.droughtFrequencyPct > 25,
            },
            {
              icon: <Mountain className="size-4" />,
              label: "Altitude",
              value: `${elevationM}m`,
              sub: thermalZoneLabel.label,
              warn: thermalZone === "lowland",
            },
            {
              icon: <Zap className="size-4" />,
              label: "Meses com risco de geada",
              value: riskMetrics.frostMonths.length > 0 ? riskMetrics.frostMonths.join(", ") : "Nenhum detectado",
              sub: "T mín < 3°C histórica",
              warn: riskMetrics.frostMonths.length > 1,
            },
          ].map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl p-3 ${m.warn ? "bg-red-500/20 border border-red-400/30" : "bg-white/10"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-blue-200">
                {m.icon}
                <span className="text-[10px] font-semibold">{m.label}</span>
              </div>
              <p className="text-sm font-bold text-white">{m.value}</p>
              <p className="text-[10px] text-blue-200 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Thermal zone explanation */}
        <div className="mt-4 flex items-start gap-2 p-3 rounded-2xl bg-white/10">
          <Info className="size-4 text-blue-200 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-100">
            <strong>O que significa a zona térmica?</strong> {thermalZoneLabel.desc}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="rain" className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-2xl flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="rain" className="text-xs rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            💧 Chuva vs Cultura
          </TabsTrigger>
          <TabsTrigger value="years40" className="text-xs rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            📊 40 Anos de Histórico
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            📅 Calendário da Safra
          </TabsTrigger>
          <TabsTrigger value="radar" className="text-xs rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            🎯 Comparar Rotações
          </TabsTrigger>
          <TabsTrigger value="scatter" className="text-xs rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            🌡️ Temperatura Histórica
          </TabsTrigger>
        </TabsList>

        {/* Gráfico 1: Chuva vs Demanda Hídrica */}
        <TabsContent value="rain">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Droplets className="size-4 text-blue-500" />
                    Chuva Esperada vs. O que Sua Cultura Precisa
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Veja em quais meses a chuva fica abaixo do necessário para cada cultura
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 gap-1">
                    <Satellite className="size-3" /> NASA POWER (1981-2025)
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-zinc-400/40 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 gap-1">
                    <Database className="size-3" /> FAO: Demanda hídrica por cultura
                  </Badge>
                </div>
              </div>
              {/* Crop selector */}
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(CROP_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCrop(key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      selectedCrop === key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Summary phrase */}
              {(() => {
                const deficitMonths = rainVsDemandData.filter((m) => m.deficit > 20);
                return deficitMonths.length > 0 ? (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 mb-5">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Atenção:</strong> Em {deficitMonths.map((m) => m.month).join(", ")}, a chuva histórica fica{" "}
                      {Math.round(deficitMonths.reduce((s, m) => s + m.deficit, 0) / deficitMonths.length)}mm abaixo do que o{" "}
                      {CROP_LABELS[selectedCrop]} precisa. Em anos de La Niña esse déficit pode dobrar.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 mb-5">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      A chuva histórica cobre a necessidade hídrica do {CROP_LABELS[selectedCrop]} na maioria dos meses do ciclo.
                    </p>
                  </div>
                );
              })()}
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={rainVsDemandData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="mm" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown, name: unknown) => {
                      const labels: Record<string, string> = {
                        chuva: "Chuva Histórica",
                        demanda: `Necessidade do ${CROP_LABELS[selectedCrop]}`,
                        deficit: "Déficit Hídrico",
                      };
                      return [`${String(value)}mm`, labels[String(name)] ?? String(name)];
                    }}
                  />
                  <Legend
                    formatter={(value: unknown) => {
                      const labels: Record<string, string> = {
                        chuva: "Chuva mensal média histórica (NASA POWER)",
                        demanda: `Necessidade do ${CROP_LABELS[selectedCrop]} (FAO)`,
                        deficit: "Déficit (chuva abaixo do necessário)",
                      };
                      return labels[String(value)] ?? String(value);
                    }}
                  />
                  <Area type="monotone" dataKey="chuva" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRain)" />
                  <Area type="monotone" dataKey="demanda" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" fill="url(#colorDemand)" />
                  <Area type="monotone" dataKey="deficit" stroke="#ef4444" strokeWidth={1} fill="url(#colorDeficit)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico 2: 40 Anos Bons e Ruins */}
        <TabsContent value="years40">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BarChart2 className="size-4 text-blue-500" />
                    Os 40 Anos — Bons, Médios e Ruins para Esta Localização
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Cada barra é um ano. Verde = sem problema. Amarelo = 1 risco. Vermelho = geada E seca no mesmo ano.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 gap-1">
                    <Satellite className="size-3" /> NASA POWER (1981-2025)
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-zinc-400/40 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 gap-1">
                    <Database className="size-3" /> NOAA CPC (ENSO ONI)
                  </Badge>
                </div>
              </div>

              {/* ENSO Filter */}
              <div className="flex gap-2 mt-3">
                {(["all", "La Niña", "El Niño"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setEnsoFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      ensoFilter === f
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400"
                    }`}
                  >
                    {f === "all" ? "Todos os anos" : f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Summary */}
              {(() => {
                const criticalYears = fortyYearsData.filter((e) => e.hasSevereFrost && e.hasSevereDrought).length;
                const totalFiltered = fortyYearsData.length;
                return (
                  <div className={`flex items-start gap-2 p-3 rounded-xl mb-5 ${
                    criticalYears > 3
                      ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                  }`}>
                    {criticalYears > 3 ? (
                      <AlertTriangle className="size-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="size-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-xs ${criticalYears > 3 ? "text-red-700 dark:text-red-300" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {ensoFilter === "La Niña"
                        ? `Dos ${totalFiltered} anos de La Niña analisados, ${criticalYears} tiveram geada E seca no mesmo ciclo. Em anos de La Niña o risco de seca em abril dobra.`
                        : `Dos ${totalFiltered} anos analisados, ${criticalYears} foram críticos (geada + seca).`
                      }
                      {" "}A previsão da NOAA aponta La Niña para a safra 2026/27.
                    </p>
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                {[
                  { color: "#22c55e", label: "Ano bom (sem eventos extremos)" },
                  { color: "#f59e0b", label: "Risco médio (seca OU geada)" },
                  { color: "#ef4444", label: "Ano crítico (geada E seca)" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="size-3 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span className="text-zinc-600 dark:text-zinc-400">{l.label}</span>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fortyYearsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 9 }} interval={4} />
                  <YAxis hide />
                  <Tooltip content={<YearTooltip />} />
                  <ReferenceLine x={2026} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" label={{ value: "2026", position: "top", fontSize: 10, fill: "#ef4444" }} />
                  <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                    {fortyYearsData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} opacity={entry.year === 2026 ? 1 : 0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico 3: Calendário Visual Gantt */}
        <TabsContent value="calendar">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="size-4 text-blue-500" />
                    Calendário Visual da Safra — O que Fazer Mês a Mês
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    A linha vermelha mostra onde estamos hoje (Novembro 2026). Clique em cada mês para saber o que fazer.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 gap-1">
                    <Database className="size-3" /> Fonte: MAPA / ZARC 2026
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 gap-1">
                    <Satellite className="size-3" /> Risco: NASA POWER
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 mb-5">
                <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Você está em Novembro 2026.</strong> A soja que plantou em outubro está em pleno crescimento vegetativo.
                  Em fevereiro, você vai decidir: trigo nas baixadas (menos risco de geada) ou milho com braquiária nas encostas (proteção do solo + renda).
                  A decisão precisa ser tomada antes de 10 de fevereiro para respeitar a janela ZARC do milho safrinha.
                </p>
              </div>

              {/* Gantt visual custom (simpler - table based) */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-2 pr-3 font-semibold text-zinc-500 dark:text-zinc-400 w-28">Cultura</th>
                      {GANTT_MONTHS.map((m, i) => (
                        <th
                          key={m}
                          className={`text-center py-2 font-semibold w-9 ${
                            i === 10
                              ? "text-red-600 dark:text-red-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {m}
                          {i === 10 && (
                            <div className="w-0.5 h-2 bg-red-500 mx-auto mt-0.5" />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {[
                      {
                        label: "🌱 Soja",
                        color: "bg-green-500",
                        months: [9, 10, 11, 0, 1, 2],
                        hint: "Plantio out-dez | Colheita fev-mar",
                      },
                      {
                        label: "🌽 Milho Safrinha",
                        color: "bg-blue-500",
                        months: [1, 2, 3, 4, 5],
                        hint: "Semear até 10/fev | Colheita jun",
                      },
                      {
                        label: "🌾 Trigo",
                        color: "bg-amber-400",
                        months: [4, 5, 6, 7, 8],
                        hint: "Semear abr-mai | Colheita set-out",
                      },
                      {
                        label: "⚠️ Risco Geada",
                        color: "bg-red-500",
                        months: [4, 5, 6],
                        hint: "Mai-Jul: geada histórica (NASA POWER)",
                      },
                      {
                        label: "🌵 Risco Seca",
                        color: "bg-orange-400",
                        months: [2, 3],
                        hint: "Mar-Abr: veranico em La Niña",
                      },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="py-2 pr-3">
                          <div className="font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{row.label}</div>
                          <div className="text-zinc-400 text-[10px] mt-0.5">{row.hint}</div>
                        </td>
                        {GANTT_MONTHS.map((_, i) => (
                          <td key={i} className="py-2 px-0.5">
                            <div
                              className={`h-7 rounded-sm ${
                                row.months.includes(i)
                                  ? row.color + " opacity-80"
                                  : "bg-zinc-100 dark:bg-zinc-800"
                              } ${i === 10 ? "ring-2 ring-red-500 ring-offset-1 dark:ring-offset-zinc-900" : ""}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <div className="w-0.5 h-5 bg-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  HOJE — Novembro 2026 | Próxima decisão crítica: até 10 de Fevereiro 2027 (janela ZARC milho safrinha)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico 4: Radar Rotações */}
        <TabsContent value="radar">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingDown className="size-4 text-blue-500" />
                    Comparação das 3 Rotações — Riscos Lado a Lado
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Quanto mais longe do centro, maior o valor. No risco, longe do centro = mais perigoso. Na renda e proteção, longe = melhor.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 gap-1">
                    <Satellite className="size-3" /> NASA POWER + SRTM
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 gap-1">
                    <Database className="size-3" /> MAPA / ZARC 2026
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 mb-5">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  <strong>Recomendação GroundTruth:</strong> O Milho + Braquiária equilibra melhor todos os fatores e garante cobertura do solo durante o inverno, que é o período de maior risco de erosão. O Trigo nas Baixadas é a escolha mais segura para fugir da geada.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={ROTATION_RADAR_DATA}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Rotação Atual (Milho)" dataKey="Rotação Atual (Milho)" stroke="#6b7280" fill="#6b7280" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Trigo nas Baixadas" dataKey="Trigo nas Baixadas" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Milho + Braquiária" dataKey="Milho + Braquiária" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-zinc-400 text-center mt-2">
                Eixos: Risco Geada e Risco Seca — quanto maior o valor, pior. Proteção Solo e Renda — quanto maior, melhor.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico 5: Scatter temperatura mínima */}
        <TabsContent value="scatter">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ThermometerSnowflake className="size-4 text-blue-500" />
                    Temperatura Mínima Registrada em Cada Junho/Julho — 1985 a 2026
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Cada ponto é um ano. Os pontos abaixo da linha vermelha = anos com risco real de geada no milho safrinha.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 gap-1">
                  <Satellite className="size-3" /> NASA POWER (T2M_MIN) + NOAA ONI
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 mb-5">
                <Info className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>O padrão é claro:</strong> Em anos de La Niña (pontos azuis), a temperatura mínima em junho cai em média 2°C a mais do que em anos de El Niño.
                  Isso explica por que a geada de 2026 foi mais intensa — ano de La Niña confirmado pela NOAA.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                {[
                  { color: "#1d4ed8", label: "Ano La Niña (maior risco de geada)" },
                  { color: "#f97316", label: "Ano El Niño (menor risco de geada)" },
                  { color: "#6b7280", label: "Ano Neutro" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-zinc-600 dark:text-zinc-400">{l.label}</span>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
                  <XAxis
                    dataKey="year"
                    type="number"
                    domain={[1984, 2027]}
                    tick={{ fontSize: 10 }}
                    label={{ value: "Ano", position: "insideBottom", offset: -5, fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="temp"
                    type="number"
                    domain={[-8, 10]}
                    tick={{ fontSize: 10 }}
                    unit="°C"
                    label={{ value: "T mín. (°C)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={3}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    label={{ value: "Limite de Geada (3°C)", position: "right", fontSize: 10, fill: "#ef4444" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                      fontSize: "12px",
                    }}
                    formatter={(value: unknown, name: unknown) => [
                      `${String(value)}${name === "temp" ? "°C" : ""}`,
                      name === "temp" ? "Temperatura mínima" : "Ano",
                    ]}
                  />
                  <Scatter
                    name="La Niña"
                    data={laNinaScatter}
                    fill="#1d4ed8"
                    opacity={0.7}
                    r={4}
                  />
                  <Scatter
                    name="El Niño"
                    data={elNinoScatter}
                    fill="#f97316"
                    opacity={0.7}
                    r={4}
                  />
                  <Scatter
                    name="Neutro"
                    data={neutroScatter}
                    fill="#6b7280"
                    opacity={0.6}
                    r={3}
                  />
                  {/* Highlight 2026 */}
                  <Scatter
                    name="2026 (caso real)"
                    data={tempScatterData.filter((d) => d.year === 2026)}
                    fill="#ef4444"
                    r={7}
                    shape="star"
                  />
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-zinc-400 text-center mt-2">
                Pontos abaixo da linha vermelha = risco real de geada detectado pela NASA (T2M_MIN &lt; 3°C em junho/julho). Fonte: NASA POWER MERRA-2 (1981-2025) + NOAA CPC ONI.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
