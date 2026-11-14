"use client";

import React, { useState } from "react";
import { PARANA_MESOREGIONS, SAMPLE_FARMS, ParanaMesoregion } from "@/data/regions_data";
import { BrazilDrilldownMap } from "@/components/map/BrazilDrilldownMap";
import { ParanaRegionalMap } from "@/components/map/ParanaRegionalMap";
import { TopographyPlotView } from "@/components/farm/TopographyPlotView";
import { ClimateHistoryChart } from "@/components/farm/ClimateHistoryChart";
import { RotationComparison } from "@/components/farm/RotationComparison";
import { CropPlanOnePagerModal } from "@/components/farm/CropPlanOnePagerModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Satellite,
  ArrowLeft,
  Share2,
  Sparkles,
  MapPin,
  ChevronRight
} from "lucide-react";

// Pre-loaded NASA data
import nasaClimatology from "@/data/nasa_locations_climatology.json";
import historicalEvents from "@/data/historical_events_40years.json";

export default function Home() {
  // Navigation Levels: 1 (Brazil), 2 (Parana Regions), 3 (Farm Detail)
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);
  const [selectedStateId, setSelectedStateId] = useState<string>("PR");
  const [selectedMesoregion, setSelectedMesoregion] = useState<ParanaMesoregion>(PARANA_MESOREGIONS[0]);
  const [selectedZone, setSelectedZone] = useState<"all" | "lowland" | "slope" | "plateau">("all");
  const [isOnePagerOpen, setIsOnePagerOpen] = useState(false);

  // Default Farm for Level 3
  const currentFarm = SAMPLE_FARMS["fazenda-santa-maria"];
  const patoBrancoClim = nasaClimatology.find((l) => l.id === "pato-branco") || nasaClimatology[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top NASA Space Apps Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Satellite className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">GROUNDTRUTH</span>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] py-0 px-2">
                  NASA Space Apps 2026
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-400">
                Desafio Field Shift • Adaptação de Lavouras com 40 Anos de Satélites
              </p>
            </div>
          </div>
        </div>

        {/* Level Breadcrumb Navigation Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setCurrentLevel(1)}
            className={`px-3 py-1 rounded-lg transition-all ${
              currentLevel === 1
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            1. Brasil
          </button>
          <ChevronRight className="size-3 text-zinc-600" />
          <button
            onClick={() => setCurrentLevel(2)}
            className={`px-3 py-1 rounded-lg transition-all ${
              currentLevel === 2
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            2. Paraná
          </button>
          <ChevronRight className="size-3 text-zinc-600" />
          <button
            onClick={() => setCurrentLevel(3)}
            className={`px-3 py-1 rounded-lg transition-all ${
              currentLevel === 3
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            3. Fazenda & Relevo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsOnePagerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8 font-medium shadow-md shadow-emerald-600/20"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Plano de Safra</span>
          </Button>
        </div>
      </header>

      {/* Main Interactive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* LEVEL 1: National View (Brazil Map) */}
        {currentLevel === 1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-zinc-900/40 border border-blue-500/20 backdrop-blur">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
                  <Sparkles className="size-3.5" />
                  <span>Decisão real no nível da lavoura com dados espaciais</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  O que plantar, onde e quando com base em 40 anos de satélites da NASA
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Cruze dados diários da NASA POWER (1981-2025) com o modelo de relevo SRTM (30m) para prever o risco de geada em baixadas e estiagem em anos de La Niña. Escolha um estado abaixo para iniciar.
                </p>
              </div>
            </div>

            <BrazilDrilldownMap
              selectedStateId={selectedStateId}
              onSelectState={(stateId) => {
                setSelectedStateId(stateId);
                if (stateId === "PR") {
                  setCurrentLevel(2);
                }
              }}
            />
          </div>
        )}

        {/* LEVEL 2: State Subdivisions (Paraná Mesoregions) */}
        {currentLevel === 2 && (
          <div className="space-y-6">
            <ParanaRegionalMap
              selectedRegionId={selectedMesoregion.id}
              onBackToBrazil={() => setCurrentLevel(1)}
              onSelectMesoregion={(region) => {
                setSelectedMesoregion(region);
                setCurrentLevel(3);
              }}
            />
          </div>
        )}

        {/* LEVEL 3: Farm Plot, SRTM Topography & Rotation Decision Engine */}
        {currentLevel === 3 && (
          <div className="space-y-8">
            {/* Top Navigation & Breadcrumb for Level 3 */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentLevel(2)}
                  className="text-zinc-400 hover:text-white gap-1 text-xs px-2 h-8"
                >
                  <ArrowLeft className="size-3.5" /> Mesorregiões do Paraná
                </Button>
                <span className="text-zinc-600">/</span>
                <span className="font-semibold text-blue-400">{selectedMesoregion.name}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-200 font-semibold">{currentFarm.name} ({currentFarm.municipality})</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                  {currentFarm.totalHectares} ha Monitorados
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOnePagerOpen(true)}
                  className="border-zinc-700 text-zinc-300 hover:text-white text-xs gap-1.5 h-8"
                >
                  <Share2 className="size-3.5" /> Plano de Safra (WhatsApp)
                </Button>
              </div>
            </div>

            {/* Farm Header Summary */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="size-5 text-blue-400" />
                    {currentFarm.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {currentFarm.municipality} • Solo: {currentFarm.soilType}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-zinc-400 block">Sistema Atual:</span>
                  <span className="text-xs font-semibold text-zinc-200">
                    {currentFarm.currentSystem}
                  </span>
                </div>
              </div>
            </div>

            {/* Component 1: NASA SRTM Topography Model */}
            <TopographyPlotView
              farm={currentFarm}
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(zone)}
            />

            {/* Component 2: NASA Climatology & 40-Year Timeline */}
            <ClimateHistoryChart
              climatologyData={patoBrancoClim.climatology}
              historicalEvents={historicalEvents}
            />

            {/* Component 3: 3 Crop Rotation Strategies Comparison */}
            <RotationComparison
              farm={currentFarm}
              onOpenOnePager={() => setIsOnePagerOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Printable / Shareable One-Pager Modal */}
      <CropPlanOnePagerModal
        isOpen={isOnePagerOpen}
        onClose={() => setIsOnePagerOpen(false)}
        farm={currentFarm}
      />

      {/* Footer with Mandatory NASA Attribution */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-6 mt-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-zinc-300">
              GroundTruth — Field Shift: Adapting Farms with NASA Data
            </p>
            <p className="text-[11px] text-zinc-400">
              Fontes oficiais: NASA POWER (MERRA-2 Climatology & Daily), NASA SRTM 30m, NOAA CPC (ENSO ONI), MAPA ZARC & DERAL Paraná.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              NASA POWER
            </a>
            <span>•</span>
            <a
              href="https://www.spaceappschallenge.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              NASA Space Apps 2026
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
