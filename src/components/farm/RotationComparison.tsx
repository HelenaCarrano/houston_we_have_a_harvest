"use client";

import React, { useState } from "react";
import { FarmDetails } from "@/data/regions_data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  HelpCircle,
  Sprout,
  Calendar,
  Share2
} from "lucide-react";

interface RotationComparisonProps {
  farm: FarmDetails;
  onOpenOnePager: () => void;
}

export function RotationComparison({ farm, onOpenOnePager }: RotationComparisonProps) {
  const [selectedRotationId, setSelectedRotationId] = useState<string>("opcao-2-trigo");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <h3 className="text-xl font-bold text-white">
              Comparador de Rotações de Safra (Obrigatório Desafio NASA)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Comparação da rotação atual com alternativas adaptadas ao relevo e ao risco climático da fazenda.
          </p>
        </div>

        <Button
          onClick={onOpenOnePager}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 text-xs h-9 shadow-lg shadow-emerald-600/20"
        >
          <Share2 className="size-3.5" />
          Gerar Plano de Safra (1 Página para WhatsApp)
        </Button>
      </div>

      {/* 3 Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {farm.rotations.map((rotation) => {
          const isSelected = selectedRotationId === rotation.id;

          return (
            <Card
              key={rotation.id}
              onClick={() => setSelectedRotationId(rotation.id)}
              className={`transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-zinc-900 border-blue-500 ring-2 ring-blue-500/50 shadow-2xl"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <CardHeader className="pb-3 border-b border-zinc-800/80">
                <div className="flex items-center justify-between gap-2 mb-1">
                  {rotation.isCurrent ? (
                    <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">
                      Rotação Atual
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                      Alternativa Adaptativa
                    </Badge>
                  )}

                  <Badge
                    variant={rotation.badgeColor === "destructive" ? "destructive" : "default"}
                    className={`text-[10px] ${
                      rotation.badgeColor === "secondary"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : ""
                    }`}
                  >
                    {rotation.recommendationBadge}
                  </Badge>
                </div>

                <CardTitle className="text-base font-bold text-white leading-snug">
                  {rotation.title}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  {rotation.cropSequence}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs flex-1">
                {/* Frost Vulnerability */}
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Risco de Geada:</span>
                    <span
                      className={
                        rotation.frostRiskLevel === "Alto"
                          ? "text-red-400 font-bold"
                          : rotation.frostRiskLevel === "Médio"
                          ? "text-amber-400 font-semibold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {rotation.frostRiskLevel}
                    </span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {rotation.frostProbabilityText}
                  </p>
                </div>

                {/* Drought Vulnerability */}
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Risco de Seca (Veranico):</span>
                    <span
                      className={
                        rotation.droughtRiskLevel === "Alto"
                          ? "text-red-400 font-bold"
                          : rotation.droughtRiskLevel === "Médio"
                          ? "text-amber-400 font-semibold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {rotation.droughtRiskLevel}
                    </span>
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {rotation.droughtProbabilityText}
                  </p>
                </div>

                {/* Soil Protection Score */}
                <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Sprout className="size-3.5 text-emerald-400" />
                    Proteção do Solo:
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {rotation.soilProtectionScore}
                  </p>
                </div>

                {/* Optimal Planting Window (ZARC) */}
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Calendar className="size-3.5 text-blue-400" />
                    Janela Oficial ZARC:
                  </span>
                  <p className="text-zinc-300 font-medium text-[11px]">
                    {rotation.optimalWindow}
                  </p>
                </div>

                {/* Where to plant in the farm (Topography SRTM match) */}
                <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Onde Plantar na Fazenda:
                  </span>
                  <p className="text-xs text-zinc-200 font-semibold">
                    {rotation.idealMicrozone}
                  </p>
                </div>
              </CardContent>

              {/* Agronomist check warning */}
              <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 space-y-1">
                <span className="font-medium text-amber-400 flex items-center gap-1">
                  <HelpCircle className="size-3.5" /> Confirmar com agrônomo:
                </span>
                <p>{rotation.agronomyRecommendation}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Decision Summary Banner */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center md:justify-start">
            <Check className="size-4 text-emerald-400" />
            Estratégia Combinada Recomendada pelo GroundTruth
          </h4>
          <p className="text-xs text-zinc-300 max-w-3xl">
            <strong>Mosaico Inteligente:</strong> Plante <strong>Trigo</strong> nos 65 hectares de baixada (talhões 1 a 3) para neutralizar o lago de ar frio, e mantenha <strong>Milho consorciado com Braquiária</strong> nos 120 hectares de encosta e topo para segurar a umidade e conter erosão.
          </p>
        </div>

        <Button
          onClick={onOpenOnePager}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs whitespace-nowrap"
        >
          Visualizar Plano de Safra
        </Button>
      </div>
    </div>
  );
}
