"use client";

import React, { useState } from "react";
import { PARANA_MESOREGIONS, ParanaMesoregion } from "@/data/regions_data";
import paranaStateData from "@/data/parana_projected_state.json";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Mountain,
  Snowflake,
  SunMedium,
  CheckCircle,
  Satellite,
  Database
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
      {/* Navigation Breadcrumb Bar with MANDATORY Source Label */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToBrazil}
            className="text-zinc-400 hover:text-white gap-1 text-xs px-2 h-8"
          >
            <ArrowLeft className="size-3.5" /> Brasil (Mapa Geral)
          </Button>
          <span className="text-zinc-600">/</span>
          <span className="font-semibold text-blue-400 text-xs">Paraná (PR)</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 text-xs font-medium">Mesorregiões e Polos Agrícolas (Nível 2)</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
            <Satellite className="size-3 mr-1" /> Fonte: NASA POWER (MERRA-2)
          </Badge>
          <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-400 bg-blue-500/10">
            <Database className="size-3 mr-1" /> Fonte: DERAL / IDR-PR 2026
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map of Paraná with Official IBGE Contours */}
        <Card className="lg:col-span-7 bg-zinc-900/70 border-zinc-800 backdrop-blur shadow-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Mapa Oficial do Paraná e Polos Agrícolas
              </CardTitle>
              <span className="text-[10px] text-zinc-400 font-mono">Fonte: IBGE / Malha Estadual</span>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Polos agrícolas monitorados pela NASA POWER. A altitude (NASA SRTM) varia de 580m no norte até mais de 1.000m no Centro-Sul.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex flex-col items-center">
            {/* Paraná High-Res SVG Map */}
            <div className="relative w-full max-w-[620px] aspect-[700/480] flex items-center justify-center">
              <svg
                viewBox="0 0 700 480"
                className="w-full h-full drop-shadow-xl select-none"
              >
                <defs>
                  <linearGradient id="prStateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  
                  {/* Glowing filter for selected cities */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Official High-Resolution State Polygon from IBGE */}
                <path
                  d={paranaStateData.path}
                  fill="url(#prStateGrad)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Sub-region approximate influence zones */}
                {/* Sudoeste zone highlight */}
                <path
                  d="M100,340 C140,320 230,340 270,410 L250,440 L180,410 Z"
                  fill="#0284c7"
                  opacity={activeRegion.id === "sudoeste" ? "0.35" : "0.15"}
                  className="transition-opacity cursor-pointer"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "sudoeste");
                    if (r) setActiveRegion(r);
                  }}
                />

                {/* Oeste zone highlight */}
                <path
                  d="M75,240 C110,210 180,220 190,320 L110,335 Z"
                  fill="#10b981"
                  opacity={activeRegion.id === "oeste" ? "0.35" : "0.15"}
                  className="transition-opacity cursor-pointer"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "oeste");
                    if (r) setActiveRegion(r);
                  }}
                />

                {/* North Central highlight */}
                <path
                  d="M230,60 C320,40 450,60 460,150 L300,160 Z"
                  fill="#f59e0b"
                  opacity={activeRegion.id === "norte-central" ? "0.35" : "0.15"}
                  className="transition-opacity cursor-pointer"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "norte-central");
                    if (r) setActiveRegion(r);
                  }}
                />

                {/* Centro-Sul highlight */}
                <path
                  d="M240,250 C320,230 400,260 390,370 L260,370 Z"
                  fill="#8b5cf6"
                  opacity={activeRegion.id === "centro-sul" ? "0.35" : "0.15"}
                  className="transition-opacity cursor-pointer"
                  onClick={() => {
                    const r = PARANA_MESOREGIONS.find((x) => x.id === "centro-sul");
                    if (r) setActiveRegion(r);
                  }}
                />

                {/* Region Text Watermarks */}
                <text x="190" y="440" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" opacity="0.8">
                  Sudoeste (Pato Branco)
                </text>
                <text x="145" y="220" fill="#34d399" fontSize="13" fontWeight="bold" textAnchor="middle" opacity="0.8">
                  Oeste (Cascavel)
                </text>
                <text x="360" y="75" fill="#fbbf24" fontSize="13" fontWeight="bold" textAnchor="middle" opacity="0.8">
                  Norte (Londrina/Maringá)
                </text>
                <text x="320" y="310" fill="#c084fc" fontSize="13" fontWeight="bold" textAnchor="middle" opacity="0.8">
                  Centro-Sul (Guarapuava)
                </text>
                <text x="540" y="290" fill="#94a3b8" fontSize="12" fontWeight="600" textAnchor="middle" opacity="0.8">
                  Curitiba / Leste
                </text>

                {/* Render Official Projected Cities */}
                {paranaStateData.cities.map((city) => {
                  const isShowcase = city.isShowcase;

                  return (
                    <g
                      key={city.name}
                      className="cursor-pointer group"
                      onClick={() => {
                        if (city.name.includes("Pato") || city.name.includes("Beltrão")) {
                          const r = PARANA_MESOREGIONS.find((x) => x.id === "sudoeste");
                          if (r) setActiveRegion(r);
                        } else if (city.name.includes("Cascavel") || city.name.includes("Toledo")) {
                          const r = PARANA_MESOREGIONS.find((x) => x.id === "oeste");
                          if (r) setActiveRegion(r);
                        }
                      }}
                    >
                      {/* Pulse circle on Showcase city (Pato Branco) */}
                      {isShowcase && (
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r="14"
                          fill="#38bdf8"
                          className="animate-ping opacity-40 pointer-events-none"
                        />
                      )}

                      {/* City point */}
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={isShowcase ? 6 : 4}
                        fill={isShowcase ? "#38bdf8" : "#94a3b8"}
                        stroke="#ffffff"
                        strokeWidth={isShowcase ? 2 : 1}
                        className="transition-transform group-hover:scale-125"
                      />

                      {/* City Label */}
                      <text
                        x={city.x + (city.x > 500 ? -8 : 8)}
                        y={city.y + 4}
                        textAnchor={city.x > 500 ? "end" : "start"}
                        fontSize={isShowcase ? "11" : "9"}
                        fontWeight={isShowcase ? "bold" : "500"}
                        fill={isShowcase ? "#ffffff" : "#cbd5e1"}
                        className="pointer-events-none drop-shadow"
                      >
                        {city.name} {isShowcase && "★"}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Region selector pills */}
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
        <Card className="lg:col-span-5 bg-zinc-900/70 border-zinc-800 backdrop-blur shadow-2xl">
          <CardHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
                Diagnóstico Regional
              </span>
              
              {/* Source Tag */}
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px]">
                Fonte: NASA POWER & SRTM
              </Badge>
            </div>

            <CardTitle className="text-2xl font-bold text-white pt-1">
              {activeRegion.name}
            </CardTitle>

            <CardDescription className="text-zinc-400 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Mountain className="size-3.5 text-zinc-400" />
                Polo: {activeRegion.centerCity} • Cota: {activeRegion.avgElevation} m
              </span>
              <span className="text-[10px] text-zinc-400">Fonte: NASA SRTM 30m</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* NASA Satellite Historical Stats with Visible Sources */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                    <Snowflake className="size-3.5" /> Geada
                  </span>
                  <span className="text-[9px] text-blue-400/80 font-mono">NASA POWER</span>
                </div>
                <div className="text-xs font-bold text-white">
                  {activeRegion.frostHistoryStat}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Dias com T2M_MIN &lt; 3°C na safra
                </p>
              </div>

              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <SunMedium className="size-3.5" /> Seca
                  </span>
                  <span className="text-[9px] text-amber-400/80 font-mono">NASA SMAP</span>
                </div>
                <div className="text-xs font-bold text-white">
                  {activeRegion.droughtHistoryStat}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Estiagem em abril na emergência
                </p>
              </div>
            </div>

            {/* Regional Relief Behaviour */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                  Relevo & Microclima
                </span>
                <span className="text-[10px] text-zinc-400">Fonte: NASA SRTM 30m</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                {activeRegion.summary}
              </p>
            </div>

            {/* Ground Truth Validation with SEAB / DERAL Source */}
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle className="size-3.5" />
                  Validação no Boletim DERAL 2026
                </div>
                <span className="text-[9px] text-emerald-400/80 font-mono">Fonte: DERAL / SEAB</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Nesta mesorregião, as baixadas acumularam ar frio denso em maio de 2026, queimando o milho safrinha e feijão. Lavouras de trigo e áreas com braquiária sofreram dano mínimo.
              </p>
            </div>

            {/* Action button to Drill-Down to Level 3 */}
            <div className="pt-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 shadow-lg shadow-blue-500/20"
                onClick={() => onSelectMesoregion(activeRegion)}
              >
                Inspecionar Fazenda Piloto em {activeRegion.name} (Nível 3)
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                Ver modelo de relevo SRTM 30m, comparação de 3 rotações e plano de safra
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
