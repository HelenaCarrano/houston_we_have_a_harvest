"use client";

import React, { useState } from "react";
import { PARANA_MESOREGIONS, SAMPLE_FARMS, ParanaMesoregion } from "@/data/regions_data";
import { BrazilDrilldownMap } from "@/components/map/BrazilDrilldownMap";
import { ParanaRegionalMap } from "@/components/map/ParanaRegionalMap";
import { TopographyPlotView } from "@/components/farm/TopographyPlotView";
import { ClimateHistoryChart } from "@/components/farm/ClimateHistoryChart";
import { RotationComparison } from "@/components/farm/RotationComparison";
import { CurrentDateCropPlanner } from "@/components/farm/CurrentDateCropPlanner";
import { CropPlanOnePagerModal } from "@/components/farm/CropPlanOnePagerModal";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      {/* Top NASA Space Apps Navbar with Theme Toggle */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Satellite className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white font-heading">
                GROUNDTRUTH
              </span>
              <Badge className="bg-blue-600 text-white border-none text-[10px] py-0 px-2 font-bold rounded-full">
                NASA Space Apps 2026
              </Badge>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Field Shift • Decisões de safra com 40 anos de satélites da NASA
            </p>
          </div>
        </div>

        {/* Level Breadcrumb Navigation Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs shadow-inner">
          <button
            onClick={() => setCurrentLevel(1)}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
              currentLevel === 1
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            1. Brasil (27 Estados)
          </button>
          <ChevronRight className="size-3.5 text-zinc-400" />
          <button
            onClick={() => setCurrentLevel(2)}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
              currentLevel === 2
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            2. Mesorregiões do Paraná
          </button>
          <ChevronRight className="size-3.5 text-zinc-400" />
          <button
            onClick={() => setCurrentLevel(3)}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
              currentLevel === 3
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            3. Fazenda & Relevo SRTM
          </button>
        </div>

        {/* Right Action Bar: Theme Toggle + One-Pager WhatsApp */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          
          <Button
            size="sm"
            onClick={() => setIsOnePagerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-9 font-semibold px-3.5 rounded-full shadow-md shadow-emerald-600/20"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Plano de Safra (WhatsApp)</span>
          </Button>
        </div>
      </header>

      {/* Main Interactive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* LEVEL 1: National View (Brazil Map) */}
        {currentLevel === 1 && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-emerald-600/5 to-transparent border border-blue-200 dark:border-blue-900/40 backdrop-blur shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-xs font-semibold">
                <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Ciência da NASA explicada de forma simples para quem produz</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-heading">
                O que plantar, onde na terra e quando, sem complicar
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                O agricultor aposta o trabalho do ano em cada safra. O <strong>GroundTruth</strong> cruza 40 anos de satélites da NASA com as curvas do terreno para apontar onde o frio da geada se acumula e como proteger o solo da seca.
              </p>
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
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentLevel(2)}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white gap-1 text-xs px-2.5 h-8 rounded-lg"
                >
                  <ArrowLeft className="size-3.5" /> Mesorregiões do Paraná
                </Button>
                <span className="text-zinc-400 dark:text-zinc-600">/</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedMesoregion.name}</span>
                <span className="text-zinc-400 dark:text-zinc-600">/</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{currentFarm.name} ({currentFarm.municipality})</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-xs font-semibold py-1">
                  {currentFarm.totalHectares} ha Monitorados
                </Badge>
                <Button
                  size="sm"
                  onClick={() => setIsOnePagerOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8 font-semibold rounded-lg shadow-sm"
                >
                  <Share2 className="size-3.5" /> Enviar no WhatsApp
                </Button>
              </div>
            </div>

            {/* Farm Header Summary */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 font-heading">
                    <MapPin className="size-6 text-blue-600 dark:text-blue-400" />
                    {currentFarm.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {currentFarm.municipality} • Solo: {currentFarm.soilType}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 block">Cultivo Tradicional do Agricultor:</span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {currentFarm.currentSystem}
                  </span>
                </div>
              </div>
            </div>

            {/* NEW MODULE: Current Date Real-time Crop Planner */}
            <CurrentDateCropPlanner
              onApplyPlan={() => setIsOnePagerOpen(true)}
            />

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
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-8 mt-16 text-xs text-zinc-600 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-zinc-800 dark:text-zinc-200">
              GroundTruth — NASA Space Apps Challenge 2026 (Field Shift)
            </p>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Fontes oficiais transparentes: NASA POWER (MERRA-2 1981-2025), NASA SRTM 30m, NOAA CPC (ENSO ONI), MAPA / ZARC 2026, DERAL Paraná e IBGE 2026.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              NASA POWER API
            </a>
            <span>•</span>
            <a
              href="https://www.spaceappschallenge.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Space Apps 2026
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
