"use client";

import React, { useState } from "react";
import { PARANA_MESOREGIONS, ParanaMesoregion } from "@/data/regions_data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Mountain,
  Snowflake,
  SunMedium,
  CheckCircle
} from "lucide-react";

interface ParanaRegionalMapProps {
  onBackToBrazil: () => void;
  onSelectMesoregion: (region: ParanaMesoregion) => void;
  selectedRegionId?: string;
}

export function ParanaRegionalMap({
  onBackToBrazil,
  onSelectMesoregion,
  selectedRegionId
}: ParanaRegionalMapProps) {
  const [activeRegion, setActiveRegion] = useState<ParanaMesoregion>(
    PARANA_MESOREGIONS.find((r) => r.id === selectedRegionId) || PARANA_MESOREGIONS[0]
  );

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToBrazil}
            className="text-zinc-400 hover:text-white gap-1 text-xs px-2 h-8"
          >
            <ArrowLeft className="size-3.5" /> Brasil
          </Button>
          <span className="text-zinc-600">/</span>
          <span className="font-semibold text-blue-400 text-xs">Paraná (PR)</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 text-xs font-medium">Mesorregiões Agrícolas (Nível 2)</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
            Validação Safra 2025/26 (DERAL)
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map of Paraná with 5 Mesoregions */}
        <Card className="lg:col-span-7 bg-zinc-900/60 border-zinc-800 backdrop-blur shadow-2xl">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Mapa Regional do Paraná
              </CardTitle>
              <span className="text-xs text-zinc-400">Clique na região para detalhar</span>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Diferenças drásticas de altitude e relevo moldam os microclimas de geada e seca.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex flex-col items-center">
            {/* Paraná Regional SVG Map */}
            <div className="relative w-full max-w-[540px] aspect-[1.3/1] flex items-center justify-center">
              <svg
                viewBox="0 0 700 500"
                className="w-full h-full drop-shadow-xl select-none"
              >
                <defs>
                  {/* Gradients for regions */}
                  <linearGradient id="gradSudoeste" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient id="gradOeste" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="gradCentroSul" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#5b21b6" />
                  </linearGradient>
                  <linearGradient id="gradNorte" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="gradCamposGerais" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0e7490" />
                  </linearGradient>
                </defs>

                {/* Region 1: Norte Central / Noroeste */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "norte-central");
                    if (r) setActiveRegion(r);
                  }}
                >
                  <path
                    d="M190,140 L340,70 L480,90 L520,160 L410,210 L300,220 L210,230 Z"
                    fill={activeRegion.id === "norte-central" ? "url(#gradNorte)" : "#27272a"}
                    stroke={activeRegion.id === "norte-central" ? "#fde047" : "#3f3f46"}
                    strokeWidth={activeRegion.id === "norte-central" ? "2.5" : "1.5"}
                    className="hover:opacity-90"
                  />
                  <text x="350" y="150" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    Norte / Maringá-Londrina
                  </text>
                  <text x="350" y="168" fill="#e4e4e7" fontSize="10" textAnchor="middle">
                    (580m alt - Estiagem)
                  </text>
                </g>

                {/* Region 2: Oeste Paranaense (Cascavel / Toledo) */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "oeste");
                    if (r) setActiveRegion(r);
                  }}
                >
                  <path
                    d="M70,240 L190,210 L220,280 L190,360 L100,370 L50,290 Z"
                    fill={activeRegion.id === "oeste" ? "url(#gradOeste)" : "#27272a"}
                    stroke={activeRegion.id === "oeste" ? "#34d399" : "#3f3f46"}
                    strokeWidth={activeRegion.id === "oeste" ? "2.5" : "1.5"}
                    className="hover:opacity-90"
                  />
                  <text x="130" y="295" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    Oeste
                  </text>
                  <text x="130" y="313" fill="#e4e4e7" fontSize="10" textAnchor="middle">
                    Cascavel / Toledo (740m)
                  </text>
                </g>

                {/* Region 3: Sudoeste Paranaense (Pato Branco / Fco Beltrão) - CORE SHOWCASE */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "sudoeste");
                    if (r) setActiveRegion(r);
                  }}
                >
                  <path
                    d="M100,370 L190,360 L240,350 L270,410 L240,460 L140,450 Z"
                    fill={activeRegion.id === "sudoeste" ? "url(#gradSudoeste)" : "#1e3a8a"}
                    stroke={activeRegion.id === "sudoeste" ? "#60a5fa" : "#3b82f6"}
                    strokeWidth={activeRegion.id === "sudoeste" ? "3" : "1.5"}
                    className="hover:opacity-90"
                  />
                  {/* Highlight pulse marker on Pato Branco */}
                  <circle cx="200" cy="415" r="5" fill="#60a5fa" className="animate-ping opacity-75" />
                  <circle cx="200" cy="415" r="4" fill="#ffffff" />
                  <text x="195" y="405" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    ★ Sudoeste
                  </text>
                  <text x="195" y="435" fill="#e0f2fe" fontSize="10" fontWeight="600" textAnchor="middle">
                    Pato Branco (720m)
                  </text>
                  <text x="195" y="448" fill="#bae6fd" fontSize="9" textAnchor="middle">
                    Alerta Geada em Baixadas
                  </text>
                </g>

                {/* Region 4: Centro-Sul (Guarapuava) */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "centro-sul");
                    if (r) setActiveRegion(r);
                  }}
                >
                  <path
                    d="M220,280 L300,220 L400,250 L390,370 L270,410 L240,350 Z"
                    fill={activeRegion.id === "centro-sul" ? "url(#gradCentroSul)" : "#27272a"}
                    stroke={activeRegion.id === "centro-sul" ? "#c084fc" : "#3f3f46"}
                    strokeWidth={activeRegion.id === "centro-sul" ? "2.5" : "1.5"}
                    className="hover:opacity-90"
                  />
                  <text x="315" y="325" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    Centro-Sul
                  </text>
                  <text x="315" y="343" fill="#e4e4e7" fontSize="10" textAnchor="middle">
                    Guarapuava (1.050m)
                  </text>
                </g>

                {/* Region 5: Campos Gerais & Leste */}
                <g
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "campos-gerais");
                    if (r) setActiveRegion(r);
                  }}
                >
                  <path
                    d="M400,250 L520,160 L620,220 L580,350 L460,370 L390,370 Z"
                    fill={activeRegion.id === "campos-gerais" ? "url(#gradCamposGerais)" : "#27272a"}
                    stroke={activeRegion.id === "campos-gerais" ? "#22d3ee" : "#3f3f46"}
                    strokeWidth={activeRegion.id === "campos-gerais" ? "2.5" : "1.5"}
                    className="hover:opacity-90"
                  />
                  <text x="490" y="275" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    Campos Gerais / Leste
                  </text>
                  <text x="490" y="293" fill="#e4e4e7" fontSize="10" textAnchor="middle">
                    Ponta Grossa / Curitiba (900m)
                  </text>
                </g>
              </svg>
            </div>

            {/* Region selector tabs below */}
            <div className="w-full flex flex-wrap gap-1.5 justify-center mt-4">
              {PARANA_MESOREGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeRegion.id === region.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Region Detailed Panel */}
        <Card className="lg:col-span-5 bg-zinc-900/60 border-zinc-800 backdrop-blur shadow-2xl">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
                Diagnóstico Regional (NASA POWER + SRTM)
              </span>
              <Badge
                variant="outline"
                className={
                  activeRegion.frostRisk === "Alto"
                    ? "border-red-500/40 text-red-400 bg-red-500/10 text-xs"
                    : "border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs"
                }
              >
                Risco Geada: {activeRegion.frostRisk}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-white pt-1">
              {activeRegion.name}
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs flex items-center gap-1">
              <Mountain className="size-3.5 text-zinc-400" />
              Polo: {activeRegion.centerCity} • Altitude Média: {activeRegion.avgElevation} m
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Real NASA Climate Probability Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
                  <Snowflake className="size-4" />
                  Risco de Geada
                </div>
                <div className="text-sm font-bold text-white">
                  {activeRegion.frostHistoryStat}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Base 40 anos NASA POWER (T2M_MIN &lt; 3°C)
                </p>
              </div>

              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                  <SunMedium className="size-4" />
                  Risco de Seca
                </div>
                <div className="text-sm font-bold text-white">
                  {activeRegion.droughtHistoryStat}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Estiagem em abril na emergência
                </p>
              </div>
            </div>

            {/* Regional Relief & Summary */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                Comportamento do Relevo e Solo
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                {activeRegion.summary}
              </p>
            </div>

            {/* Impact Case Check (Safra 2026 DERAL) */}
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle className="size-4" />
                Validação em Campo (Boletim DERAL 2026)
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Nesta região, as baixadas acumularam ar denso e frio em maio de 2026, queimando o milho safrinha e feijão. Em contrapartida, lavouras de trigo e áreas com braquiária nas cotas altas sofreram dano mínimo.
              </p>
            </div>

            {/* Action button to Drill-Down to Level 3 (Farm & Relief) */}
            <div className="pt-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 shadow-lg shadow-blue-500/20"
                onClick={() => onSelectMesoregion(activeRegion)}
              >
                Inspecionar Fazenda Piloto em {activeRegion.name} (Nível 3)
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                Ver modelo de relevo SRTM 30m, comparação de rotações e plano de safra
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
