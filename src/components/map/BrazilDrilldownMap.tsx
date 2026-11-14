"use client";

import React, { useState } from "react";
import brazilStatesData from "@/data/brazil_projected_states.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  MapPin,
  CheckCircle2,
  Satellite,
  ThermometerSnowflake,
  SunMedium,
  Calendar,
  Database
} from "lucide-react";

interface BrazilDrilldownMapProps {
  onSelectState: (stateId: string) => void;
  selectedStateId?: string;
}

export function BrazilDrilldownMap({ onSelectState, selectedStateId }: BrazilDrilldownMapProps) {
  // Default to Paraná (PR)
  const defaultState = brazilStatesData.find((s) => s.sigla === "PR") || brazilStatesData[0];
  const [activeState, setActiveState] = useState(
    brazilStatesData.find((s) => s.sigla === selectedStateId) || defaultState
  );
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const filteredStates = brazilStatesData.filter((s) => {
    if (regionFilter === "all") return true;
    return s.region === regionFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Visual Map Canvas with Official IBGE Coordinates */}
      <Card className="lg:col-span-7 bg-zinc-900/70 border-zinc-800 backdrop-blur shadow-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Mapa Oficial do Brasil (27 Estados)
              </CardTitle>
            </div>
            
            {/* MANDATORY SOURCE LABEL */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[10px] gap-1">
                <Database className="size-3" /> Fonte: IBGE (Malha 2026)
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] gap-1">
                <Satellite className="size-3" /> Fonte: NASA POWER
              </Badge>
            </div>
          </div>
          <CardDescription className="text-zinc-400 text-xs">
            Geometria cartográfica oficial de alta resolução. Clique em qualquer estado brasileiro para inspecionar os riscos climáticos.
          </CardDescription>

          {/* Region Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-1 pt-2">
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "Todos os Estados" },
                { id: "Sul", label: "Sul" },
                { id: "Centro-Oeste", label: "Centro-Oeste" },
                { id: "Sudeste", label: "Sudeste" },
                { id: "Nordeste", label: "Nordeste" },
                { id: "Norte", label: "Norte" }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegionFilter(r.id)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                    regionFilter === r.id
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400">
              Exibindo {filteredStates.length} de 27 estados
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 flex flex-col items-center">
          {/* Accurate Projected SVG Map of Brazil */}
          <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
            <svg
              viewBox="0 0 620 620"
              className="w-full h-full drop-shadow-2xl select-none"
              style={{ filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.6))" }}
            >
              <defs>
                {/* Active and hover gradients */}
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="inactiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>
              </defs>

              {/* Render all 27 Brazilian states from official GeoJSON */}
              {brazilStatesData.map((state) => {
                const isSelected = activeState.sigla === state.sigla;
                const isMatchFilter = regionFilter === "all" || state.region === regionFilter;
                const isShowcase = state.sigla === "PR";

                return (
                  <g
                    key={state.sigla}
                    className="cursor-pointer transition-all duration-150 group"
                    onClick={() => {
                      setActiveState(state);
                      if (state.hasDeepDive) onSelectState(state.sigla);
                    }}
                    onMouseEnter={() => setActiveState(state)}
                  >
                    <path
                      d={state.path}
                      fill={
                        isSelected
                          ? "url(#activeGrad)"
                          : isShowcase
                          ? "#1e3a8a"
                          : isMatchFilter
                          ? "url(#inactiveGrad)"
                          : "#18181b"
                      }
                      stroke={
                        isSelected
                          ? "#93c5fd"
                          : isShowcase
                          ? "#60a5fa"
                          : isMatchFilter
                          ? "#3f3f46"
                          : "#27272a"
                      }
                      strokeWidth={isSelected ? "2.5" : isShowcase ? "2" : "1"}
                      aria-label={`${state.nome} (${state.sigla})`}
                      className={`transition-all duration-200 ${
                        isMatchFilter ? "opacity-100 hover:fill-blue-900/60 hover:stroke-blue-400" : "opacity-40"
                      }`}
                    />

                    {/* State Sigla Centroid Label */}
                    {isMatchFilter && state.centroid && (
                      <text
                        x={state.centroid[0]}
                        y={state.centroid[1]}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={isSelected ? "11" : "9"}
                        fontWeight={isSelected || isShowcase ? "bold" : "600"}
                        fill={isSelected ? "#ffffff" : isShowcase ? "#93c5fd" : "#a1a1aa"}
                        className="pointer-events-none select-none drop-shadow"
                      >
                        {state.sigla}
                      </text>
                    )}

                    {/* Showcase PR pulse marker */}
                    {isShowcase && (
                      <g className="pointer-events-none">
                        <circle cx={state.centroid[0]} cy={state.centroid[1]} r="12" fill="#60a5fa" className="animate-ping opacity-30" />
                        <circle cx={state.centroid[0]} cy={state.centroid[1]} r="3" fill="#ffffff" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Footer note inside map card */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-4 text-xs text-zinc-400 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 gap-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <strong>Paraná (PR):</strong> Modelo digital de relevo (SRTM 30m) e histórico 2026 DERAL prontos.
            </span>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium gap-1 text-xs h-7 whitespace-nowrap"
              onClick={() => onSelectState("PR")}
            >
              Explorar Paraná <ArrowRight className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* State Detail Side Panel */}
      <Card className="lg:col-span-5 bg-zinc-900/70 border-zinc-800 backdrop-blur shadow-2xl">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase flex items-center gap-1">
              <MapPin className="size-3.5" /> {activeState.region} • Região Agrícola
            </span>
            {activeState.hasDeepDive ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
                <CheckCircle2 className="size-3" /> Base Microregional Ativa
              </Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-[10px]">
                Malha Nacional
              </Badge>
            )}
          </div>

          <CardTitle className="text-2xl font-bold text-white pt-1 flex items-center justify-between">
            <span>{activeState.nome} ({activeState.sigla})</span>
          </CardTitle>

          <CardDescription className="text-zinc-400 text-xs">
            Clima: {activeState.climate}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Main Crops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Principais Culturas Monitoradas
              </h4>
              <span className="text-[10px] text-zinc-400">Fonte: IBGE PAM</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeState.crops.map((crop) => (
                <Badge
                  key={crop}
                  variant="secondary"
                  className="bg-zinc-800 text-zinc-200 border-zinc-700 text-xs"
                >
                  {crop}
                </Badge>
              ))}
            </div>
          </div>

          {/* NASA Satellite Climate Indicators */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Vulnerabilidades Climáticas
              </span>
              <span className="text-[10px] text-blue-400 font-mono">Fonte: NASA POWER (MERRA-2)</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                  <ThermometerSnowflake className="size-3.5 text-cyan-400" /> Risco Térmico / Geada
                </span>
                <span className="text-xs font-bold text-zinc-200">{activeState.frostRisk}</span>
              </div>

              <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                  <SunMedium className="size-3.5 text-amber-400" /> Risco de Seca
                </span>
                <span className="text-xs font-bold text-zinc-200">{activeState.droughtRisk}</span>
              </div>
            </div>
          </div>

          {/* NASA Satellite Deep Diagnosis Box */}
          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                <Satellite className="size-3.5" />
                Diagnóstico de Satélite da NASA (40 Anos)
              </div>
              <span className="text-[10px] text-blue-300 font-mono">Fonte: NASA POWER</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeState.nasaHighlight}
            </p>
          </div>

          {/* Official ZARC Planting Window */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-emerald-400" /> Janela Oficial ZARC
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Fonte: MAPA / ZARC 2026</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeState.zarcWindow}
            </p>
          </div>

          {/* Call to Action Button */}
          {activeState.hasDeepDive ? (
            <div className="pt-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 shadow-lg shadow-blue-500/20"
                onClick={() => onSelectState(activeState.sigla)}
              >
                Abrir Subdivisões do Paraná (Nível 2)
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                Inspecionar Sudoeste, Oeste e talhões com elevação SRTM 30m
              </p>
            </div>
          ) : (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full border-blue-500/40 text-blue-300 hover:bg-blue-950/30 gap-2"
                onClick={() => onSelectState("PR")}
              >
                Abrir Demonstração Validada no Paraná (PR)
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                A malha detalhada de relevo SRTM e talhões está calibrada no Paraná
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
