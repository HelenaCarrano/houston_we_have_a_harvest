"use client";

import React, { useState } from "react";
import { BRAZIL_STATES, RegionInfo } from "@/data/regions_data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, CheckCircle2, AlertTriangle, Satellite } from "lucide-react";

interface BrazilDrilldownMapProps {
  onSelectState: (stateId: string) => void;
  selectedStateId?: string;
}

export function BrazilDrilldownMap({ onSelectState, selectedStateId }: BrazilDrilldownMapProps) {
  const [hoveredState, setHoveredState] = useState<RegionInfo | null>(
    BRAZIL_STATES.find((s) => s.id === "PR") || null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Visual Map Canvas */}
      <Card className="lg:col-span-7 bg-zinc-900/60 border-zinc-800 backdrop-blur shadow-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Mapa Agrícola do Brasil <span className="text-xs font-normal text-zinc-400">(Nível 1)</span>
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-xs">
              <Satellite className="size-3 mr-1" /> NASA POWER Global Grid
            </Badge>
          </div>
          <CardDescription className="text-zinc-400 text-xs">
            Selecione o estado para carregar os dados de satélite da NASA, zoneamento ZARC e relevo SRTM.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 flex flex-col items-center">
          {/* SVG Map of Brazil with stylized interactive state territories */}
          <div className="relative w-full max-w-[520px] aspect-[1/0.95] flex items-center justify-center py-2">
            <svg
              viewBox="0 0 600 580"
              className="w-full h-full drop-shadow-2xl select-none"
              style={{ filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.5))" }}
            >
              <defs>
                <linearGradient id="gradPR" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="gradPRHover" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="gradOther" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>
              </defs>

              {/* Brazil Regions Background Polygons */}
              {/* Norte (AM/PA/AC/RR/AP/RO/TO) */}
              <path
                d="M120,70 L260,60 L350,90 L390,170 L340,240 L240,240 L170,220 L110,180 Z"
                fill="#1f1f23"
                stroke="#3f3f46"
                strokeWidth="1.5"
                className="opacity-70 transition-all hover:opacity-90 cursor-not-allowed"
              >
                <title>Região Norte (Em homologação)</title>
              </path>

              {/* Nordeste (MA/PI/CE/RN/PB/PE/AL/SE/BA) */}
              <path
                d="M350,90 L460,110 L510,180 L490,260 L430,310 L380,270 L340,240 L390,170 Z"
                fill="#27272a"
                stroke="#3f3f46"
                strokeWidth="1.5"
                className="transition-all hover:fill-zinc-700 cursor-pointer"
                onMouseEnter={() => setHoveredState(BRAZIL_STATES.find((s) => s.id === "BA") || null)}
                onClick={() => onSelectState("BA")}
              >
                <title>Região Nordeste / Matopiba</title>
              </path>

              {/* Centro-Oeste (MT/MS/GO/DF) */}
              <path
                d="M240,240 L340,240 L380,270 L380,380 L300,410 L250,370 L210,300 Z"
                fill="#27272a"
                stroke="#3f3f46"
                strokeWidth="1.5"
                className="transition-all hover:fill-zinc-700 cursor-pointer"
                onMouseEnter={() => setHoveredState(BRAZIL_STATES.find((s) => s.id === "MT") || null)}
                onClick={() => onSelectState("MT")}
              >
                <title>Centro-Oeste (MT / MS / GO)</title>
              </path>

              {/* Sudeste (MG/ES/SP/RJ) */}
              <path
                d="M380,310 L460,330 L450,420 L370,430 L360,370 Z"
                fill="#27272a"
                stroke="#3f3f46"
                strokeWidth="1.5"
                className="transition-all hover:fill-zinc-700 cursor-pointer"
                onMouseEnter={() => setHoveredState(BRAZIL_STATES.find((s) => s.id === "SP") || null)}
                onClick={() => onSelectState("SP")}
              >
                <title>Sudeste (SP / MG)</title>
              </path>

              {/* Região Sul: PARANÁ (Destaque Principal) */}
              <g
                className="cursor-pointer group"
                onClick={() => onSelectState("PR")}
                onMouseEnter={() => setHoveredState(BRAZIL_STATES.find((s) => s.id === "PR") || null)}
              >
                <path
                  d="M295,410 L370,410 L375,445 L320,465 L280,440 Z"
                  fill="url(#gradPR)"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  className="transition-all duration-300 filter group-hover:brightness-125"
                />
                {/* Active Pulse Point on Paraná */}
                <circle cx="330" cy="435" r="5" fill="#60a5fa" className="animate-ping opacity-75" />
                <circle cx="330" cy="435" r="4" fill="#ffffff" />
                <text
                  x="330"
                  y="430"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow"
                >
                  PR (Ativo)
                </text>
              </g>

              {/* Santa Catarina (SC) */}
              <path
                d="M305,455 L365,450 L350,480 L295,475 Z"
                fill="#27272a"
                stroke="#3f3f46"
                strokeWidth="1.5"
                className="transition-all hover:fill-zinc-700 cursor-pointer"
                onMouseEnter={() => setHoveredState(BRAZIL_STATES.find((s) => s.id === "SC") || null)}
                onClick={() => onSelectState("SC")}
              >
                <title>Santa Catarina (SC)</title>
              </path>

              {/* Rio Grande do Sul (RS) */}
              <path
                d="M290,475 L350,480 L335,535 L270,530 L260,490 Z"
                fill="#27272a"
                stroke="#3f3f46"
                strokeWidth="1.5"
                className="transition-all hover:fill-zinc-700 cursor-pointer"
                onMouseEnter={() => setHoveredState(BRAZIL_STATES.find((s) => s.id === "RS") || null)}
                onClick={() => onSelectState("RS")}
              >
                <title>Rio Grande do Sul (RS)</title>
              </path>

              {/* State Labels overlay */}
              <text x="300" y="290" fill="#71717a" fontSize="11" fontWeight="600">MT</text>
              <text x="270" y="370" fill="#71717a" fontSize="11" fontWeight="600">MS</text>
              <text x="420" y="240" fill="#71717a" fontSize="11" fontWeight="600">BA</text>
              <text x="390" y="370" fill="#71717a" fontSize="11" fontWeight="600">SP</text>
              <text x="305" y="505" fill="#71717a" fontSize="10" fontWeight="600">RS</text>
            </svg>
          </div>

          <div className="w-full flex items-center justify-between mt-3 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <strong>Paraná:</strong> Base completa com 40 anos NASA POWER + SRTM
            </span>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium gap-1 text-xs h-7"
              onClick={() => onSelectState("PR")}
            >
              Explorar Paraná <ArrowRight className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* State Detail Side Panel */}
      <Card className="lg:col-span-5 bg-zinc-900/60 border-zinc-800 backdrop-blur shadow-2xl">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Informações do Estado
            </span>
            {hoveredState?.hasDetailedData ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1">
                <CheckCircle2 className="size-3" /> Base Histórica Completa
              </Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
                Dados em Expansão
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2 pt-1">
            <MapPin className="size-5 text-blue-400" />
            {hoveredState ? `${hoveredState.name} (${hoveredState.code})` : "Selecione um Estado"}
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            {hoveredState?.climateZone || "Passe o cursor sobre os estados no mapa"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {hoveredState && (
            <>
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                  Principais Culturas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {hoveredState.mainCrops.map((crop) => (
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

              <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <AlertTriangle className="size-4" />
                  Diagnóstico Climático Histórico
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {hoveredState.climateRiskSummary}
                </p>
              </div>

              {hoveredState.hasDetailedData ? (
                <div className="pt-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 shadow-lg shadow-blue-500/20"
                    onClick={() => onSelectState(hoveredState.id)}
                  >
                    Abrir Subdivisões do Paraná (Nível 2)
                    <ArrowRight className="size-4" />
                  </Button>
                  <p className="text-[11px] text-zinc-400 text-center mt-2">
                    Visualizar Sudoeste, Oeste e talhões com elevação SRTM
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
                    onClick={() => onSelectState("PR")}
                  >
                    Ver Demonstração Validada no Paraná (PR)
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Quick State Selector Buttons */}
          <div className="pt-4 border-t border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-400 block mb-2">
              Acesso rápido por estado:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BRAZIL_STATES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setHoveredState(st);
                    if (st.hasDetailedData) onSelectState(st.id);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    st.id === (hoveredState?.id || selectedStateId)
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {st.code}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
