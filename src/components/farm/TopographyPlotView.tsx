"use client";

import React from "react";
import { FarmDetails } from "@/data/regions_data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mountain, ShieldCheck, ThermometerSnowflake, Satellite, Database } from "lucide-react";

interface TopographyPlotViewProps {
  farm: FarmDetails;
  selectedZone: "all" | "lowland" | "slope" | "plateau";
  onSelectZone: (zone: "all" | "lowland" | "slope" | "plateau") => void;
}

export function TopographyPlotView({ farm, selectedZone, onSelectZone }: TopographyPlotViewProps) {
  return (
    <Card className="bg-zinc-900/70 border-zinc-800 backdrop-blur shadow-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500" />
              <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Zoneamento Topográfico da Fazenda (NASA SRTM 30m)
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Variação altimétrica: {farm.elevationMin} m a {farm.elevationMax} m (Desnível: {farm.elevationMax - farm.elevationMin} m)
            </CardDescription>
          </div>

          {/* Prominent Data Source Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[10px] gap-1">
              <Satellite className="size-3" /> Fonte: NASA SRTM (30m Elevation Model)
            </Badge>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] gap-1">
              <Database className="size-3" /> Fonte: EMBRAPA Solos
            </Badge>
          </div>
        </div>

        {/* Zone Selector Buttons */}
        <div className="flex items-center gap-1.5 pt-2 flex-wrap">
          <button
            onClick={() => onSelectZone("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              selectedZone === "all"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Todos os Talhões ({farm.totalHectares} ha)
          </button>
          <button
            onClick={() => onSelectZone("lowland")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              selectedZone === "lowland"
                ? "bg-cyan-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Baixada Térmica (642-680m)
          </button>
          <button
            onClick={() => onSelectZone("slope")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              selectedZone === "slope"
                ? "bg-amber-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Encosta (680-720m)
          </button>
          <button
            onClick={() => onSelectZone("plateau")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              selectedZone === "plateau"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Planalto (&gt;720m)
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Interactive SVG Farm Topography Profile */}
        <div className="relative w-full aspect-[2.2/1] min-h-[240px] max-h-[320px] rounded-xl overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800 flex items-center justify-center p-4">
          <svg viewBox="0 0 900 400" className="w-full h-full select-none">
            <defs>
              {/* Shading gradients for elevation tiers */}
              <linearGradient id="lowlandGrad" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="slopeGrad" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#451a03" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="plateauGrad" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.95" />
              </linearGradient>

              {/* Cold Air Lake Pattern */}
              <pattern id="frostPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#38bdf8" opacity="0.6" />
              </pattern>
            </defs>

            {/* Elevation Curve Landscape */}
            {/* 1. Plateau (Right / Top: 720m - 765m) */}
            <path
              d="M 580 140 Q 720 120 900 130 L 900 400 L 580 400 Z"
              fill="url(#plateauGrad)"
              stroke="#34d399"
              strokeWidth={selectedZone === "plateau" ? 4 : 1.5}
              className={`cursor-pointer transition-all ${
                selectedZone === "lowland" || selectedZone === "slope" ? "opacity-35" : "opacity-100"
              }`}
              onClick={() => onSelectZone("plateau")}
            />

            {/* 2. Slope / Encosta (Middle: 680m - 720m) */}
            <path
              d="M 320 250 Q 450 180 580 140 L 580 400 L 320 400 Z"
              fill="url(#slopeGrad)"
              stroke="#fbbf24"
              strokeWidth={selectedZone === "slope" ? 4 : 1.5}
              className={`cursor-pointer transition-all ${
                selectedZone === "lowland" || selectedZone === "plateau" ? "opacity-35" : "opacity-100"
              }`}
              onClick={() => onSelectZone("slope")}
            />

            {/* 3. Lowland / Baixada (Left / Valley: 642m - 680m) */}
            <path
              d="M 0 270 Q 160 260 320 250 L 320 400 L 0 400 Z"
              fill="url(#lowlandGrad)"
              stroke="#38bdf8"
              strokeWidth={selectedZone === "lowland" ? 4 : 1.5}
              className={`cursor-pointer transition-all ${
                selectedZone === "slope" || selectedZone === "plateau" ? "opacity-35" : "opacity-100"
              }`}
              onClick={() => onSelectZone("lowland")}
            />

            {/* Cold Air Drainage Arrows */}
            <g className="opacity-70">
              <path
                d="M 570 170 C 470 210, 380 250, 240 280"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              <polygon points="230,282 245,274 242,288" fill="#7dd3fc" />
              <text x="440" y="205" fill="#7dd3fc" fontSize="11" fontStyle="italic">
                Drenagem catabática de ar frio noturno (NASA SRTM)
              </text>
            </g>

            {/* Cold air pool accumulation effect over lowland */}
            <rect
              x="20"
              y="280"
              width="280"
              height="80"
              rx="12"
              fill="url(#frostPattern)"
              className="animate-pulse"
              opacity="0.4"
            />

            {/* Zone Markers and Recommended Crops Labels */}
            {/* Lowland Label */}
            <g transform="translate(60, 310)">
              <rect width="180" height="60" rx="8" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
              <text x="12" y="22" fill="#7dd3fc" fontSize="12" fontWeight="bold">
                Talhões 1 a 3 (Baixada - 642m)
              </text>
              <text x="12" y="38" fill="#f87171" fontSize="10" fontWeight="600">
                ⚠ Alto Risco de Geada (Lago Frio)
              </text>
              <text x="12" y="52" fill="#38bdf8" fontSize="10" fontWeight="bold">
                ✓ Recomendação: Trigo
              </text>
            </g>

            {/* Slope Label */}
            <g transform="translate(360, 270)">
              <rect width="190" height="60" rx="8" fill="#451a03" stroke="#fbbf24" strokeWidth="1.5" opacity="0.9" />
              <text x="12" y="22" fill="#fde68a" fontSize="12" fontWeight="bold">
                Talhões 4 a 6 (Encosta - 700m)
              </text>
              <text x="12" y="38" fill="#f59e0b" fontSize="10" fontWeight="600">
                ⚠ Declive &gt; 8% (Risco Erosão)
              </text>
              <text x="12" y="52" fill="#fbbf24" fontSize="10" fontWeight="bold">
                ✓ Rec: Milho + Braquiária
              </text>
            </g>

            {/* Plateau Label */}
            <g transform="translate(640, 180)">
              <rect width="190" height="60" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" opacity="0.9" />
              <text x="12" y="22" fill="#a7f3d0" fontSize="12" fontWeight="bold">
                Talhões 7 a 9 (Planalto - 755m)
              </text>
              <text x="12" y="38" fill="#34d399" fontSize="10" fontWeight="600">
                ✓ Zona Térmica Segura
              </text>
              <text x="12" y="52" fill="#a7f3d0" fontSize="10" fontWeight="bold">
                ✓ Rec: Soja precoce / Milho
              </text>
            </g>
          </svg>
        </div>

        {/* Breakdown of areas in the farm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Lowland Card */}
          <div
            onClick={() => onSelectZone("lowland")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedZone === "lowland"
                ? "border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500"
                : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <ThermometerSnowflake className="size-4" />
                Baixada ({farm.reliefDistribution.lowlandPct}% da área)
              </span>
              <Badge variant="destructive" className="text-[10px] h-5">
                Geada Severa
              </Badge>
            </div>
            <div className="text-xs text-zinc-300 space-y-1">
              <div className="flex items-center justify-between">
                <span><strong>Altitude:</strong> 642 m a 680 m</span>
                <span className="text-[10px] text-zinc-400 font-mono">Fonte: NASA SRTM</span>
              </div>
              <p className="text-zinc-400">
                Em noites de céu límpido, o ar frio escorre das partes altas e se acumula aqui. Queimou o milho safrinha em 2026.
              </p>
              <p className="text-cyan-300 font-medium pt-1">
                Sugestão GroundTruth: <strong>Trigo de inverno</strong>
              </p>
            </div>
          </div>

          {/* Slope Card */}
          <div
            onClick={() => onSelectZone("slope")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedZone === "slope"
                ? "border-amber-500 bg-amber-950/40 ring-1 ring-amber-500"
                : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Mountain className="size-4" />
                Encosta ({farm.reliefDistribution.slopePct}% da área)
              </span>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] h-5">
                Risco Erosão
              </Badge>
            </div>
            <div className="text-xs text-zinc-300 space-y-1">
              <div className="flex items-center justify-between">
                <span><strong>Altitude:</strong> 680 m a 720 m</span>
                <span className="text-[10px] text-zinc-400 font-mono">Fonte: NASA SRTM</span>
              </div>
              <p className="text-zinc-400">
                Boa drenagem de ar frio, mas vulnerável a enxurradas se ficar sem palhada entre as safras.
              </p>
              <p className="text-amber-300 font-medium pt-1">
                Sugestão GroundTruth: <strong>Milho + Braquiária consorciada</strong>
              </p>
            </div>
          </div>

          {/* Plateau Card */}
          <div
            onClick={() => onSelectZone("plateau")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedZone === "plateau"
                ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500"
                : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="size-4" />
                Planalto / Topo ({farm.reliefDistribution.plateauPct}% da área)
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] h-5">
                Área Protegida
              </Badge>
            </div>
            <div className="text-xs text-zinc-300 space-y-1">
              <div className="flex items-center justify-between">
                <span><strong>Altitude:</strong> 720 m a 765 m</span>
                <span className="text-[10px] text-zinc-400 font-mono">Fonte: NASA SRTM</span>
              </div>
              <p className="text-zinc-400">
                Camada térmica mais aquecida por circulação de ar. Menor incidência de geadas de radiação.
              </p>
              <p className="text-emerald-300 font-medium pt-1">
                Sugestão GroundTruth: <strong>Milho safrinha solteiro ou consórcio</strong>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
