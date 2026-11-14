"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThermometerSnowflake, Droplets, Sparkles, Filter } from "lucide-react";

interface ClimateHistoryChartProps {
  climatologyData: Array<{
    month: string;
    monthName: string;
    minTemp: number;
    maxTemp: number;
    precipitationMmDay: number;
    totalPrecipMmMonth: number;
    soilMoistureRoot: number;
  }>;
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
}

export function ClimateHistoryChart({ climatologyData, historicalEvents }: ClimateHistoryChartProps) {
  const [ensoFilter, setEnsoFilter] = useState<"all" | "La Niña" | "El Niño">("all");

  const filteredHistory = historicalEvents.filter((item) => {
    if (ensoFilter === "all") return true;
    return item.enso === ensoFilter;
  });

  const totalYears = filteredHistory.length;
  const frostYearsCount = filteredHistory.filter((y) => y.hasSevereFrost).length;
  const droughtYearsCount = filteredHistory.filter((y) => y.hasSevereDrought).length;

  const frostRatioText = `${Math.round((frostYearsCount / (totalYears || 1)) * 10)} de cada 10 anos`;
  const droughtRatioText = `${Math.round((droughtYearsCount / (totalYears || 1)) * 10)} de cada 10 anos`;

  return (
    <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur shadow-2xl">
      <CardHeader className="pb-3 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-400" />
              <CardTitle className="text-lg font-semibold text-zinc-100">
                Evidências da NASA: Climatologia e 40 Anos de Histórico
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Dados do satélite NASA POWER (1981-2025) cruzados com registros de perdas da safra no Paraná
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10 text-xs gap-1">
              <Sparkles className="size-3 text-amber-400" />
              Próxima Safra: Tendência La Niña
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="climatology" className="w-full">
          <TabsList className="bg-zinc-950/80 border border-zinc-800 mb-6 p-1">
            <TabsTrigger value="climatology" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Climatologia Mensal (Médias de Temperatura e Chuva)
            </TabsTrigger>
            <TabsTrigger value="history40" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Série Histórica de 40 Anos (Geadas e Secas por Ano)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Monthly Climatology Chart */}
          <TabsContent value="climatology" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="size-4 text-cyan-400" />
                <span>
                  <strong>Zona Crítica de Geada:</strong> Maio a Julho registram temperaturas mínimas abaixo de 0°C a -4.2°C na NASA POWER.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="size-4 text-blue-400" />
                <span>
                  <strong>Estiagem de Outono:</strong> Precipitação cai em abril/julho na fase vegetativa do milho safrinha.
                </span>
              </div>
            </div>

            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={climatologyData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="monthName" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis
                    yAxisId="temp"
                    stroke="#71717a"
                    fontSize={11}
                    unit="°C"
                    domain={[-6, 38]}
                  />
                  <YAxis
                    yAxisId="rain"
                    orientation="right"
                    stroke="#71717a"
                    fontSize={11}
                    unit="mm"
                    domain={[0, 250]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#f4f4f5", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                  {/* Frost threshold reference line */}
                  <ReferenceLine
                    y={3}
                    yAxisId="temp"
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: "Limite Geada (3°C ar / 0°C solo)", fill: "#f87171", fontSize: 10, position: "insideBottomLeft" }}
                  />

                  {/* Precipitation Bars */}
                  <Bar
                    yAxisId="rain"
                    dataKey="totalPrecipMmMonth"
                    name="Chuva Mensal (mm)"
                    fill="#3b82f6"
                    opacity={0.65}
                    radius={[4, 4, 0, 0]}
                  />

                  {/* Temperature Lines */}
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="maxTemp"
                    name="Temp. Máxima (°C)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="minTemp"
                    name="Temp. Mínima (°C)"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#38bdf8" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* TAB 2: 40-Year Timeline with ENSO Filter */}
          <TabsContent value="history40" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 font-medium">Filtrar por Ciclo Oceânico (NOAA ONI):</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEnsoFilter("all")}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      ensoFilter === "all" ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Todos (40 anos)
                  </button>
                  <button
                    onClick={() => setEnsoFilter("La Niña")}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      ensoFilter === "La Niña" ? "bg-blue-600 text-white font-semibold" : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Anos de La Niña (Próxima Estação)
                  </button>
                  <button
                    onClick={() => setEnsoFilter("El Niño")}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      ensoFilter === "El Niño" ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Anos de El Niño
                  </button>
                </div>
              </div>

              {/* Dynamic Probability Indicators */}
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  Risco de Geada: <strong>{frostRatioText}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Risco de Seca: <strong>{droughtRatioText}</strong>
                </span>
              </div>
            </div>

            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredHistory} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} interval={2} />
                  <YAxis
                    yAxisId="frost"
                    stroke="#71717a"
                    fontSize={11}
                    unit=" dias"
                    domain={[0, 8]}
                  />
                  <YAxis
                    yAxisId="rain"
                    orientation="right"
                    stroke="#71717a"
                    fontSize={11}
                    unit="mm"
                    domain={[0, 220]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#f4f4f5", fontWeight: "bold" }}
                    formatter={(value: unknown, name: unknown) => {
                      const nameStr = String(name);
                      if (nameStr === "Dias com Geada (Maio-Jul)") return [`${value} dias`, nameStr];
                      if (nameStr === "Chuva de Abril (mm)") return [`${value} mm`, nameStr];
                      return [String(value), nameStr];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                  {/* Drought Line */}
                  <Line
                    yAxisId="rain"
                    type="monotone"
                    dataKey="aprilRainMm"
                    name="Chuva de Abril (mm)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 2.5 }}
                  />

                  {/* Frost Bar */}
                  <Bar
                    yAxisId="frost"
                    dataKey="frostDaysCritical"
                    name="Dias com Geada (Maio-Jul)"
                    fill="#38bdf8"
                    radius={[3, 3, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              💡 <em>Em anos de La Niña, o risco de estiagem severa em abril dobra, e as geadas de maio/junho atingem o milho ainda em formação de grão.</em>
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
