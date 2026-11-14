"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Satellite,
  Database
} from "lucide-react";

interface CurrentDateCropPlannerProps {
  onApplyPlan?: (planTitle: string) => void;
}

// Current date and active crop options
export function CurrentDateCropPlanner({ onApplyPlan }: CurrentDateCropPlannerProps) {
  // Current local time is mid-November
  const currentDateFormatted = "14 de Novembro de 2026";
  const currentMonthName = "Novembro";

  // State: current planted crop in farm
  const [currentPlanted, setCurrentPlanted] = useState<string>("soja");

  // Plan generation based on current selection
  const plans = {
    soja: {
      cropName: "Soja de Verão",
      status: "Em pleno desenvolvimento vegetativo / floração",
      harvestWindow: "Fevereiro a Março de 2027",
      immediateAttention: "Solo com boa umidade de primavera (NASA SMAP). O risco iminente nos próximos 60 dias é baixo para geada, mas atenção a veranicos em janeiro.",
      nextRotationOptions: [
        {
          id: "trigo_baixada",
          title: "Opção A: Trigo nas Baixadas",
          tag: "Melhor para fugir da geada",
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          schedule: "Semeadura entre 15 de Abril e 20 de Maio de 2027 (ZARC)",
          plainExplanation: "Depois de colher a soja em fevereiro/março, o produtor deixa a terra descansar um pouco ou usa aveia rápida. Em maio entra com trigo nas áreas mais baixas da fazenda, porque o trigo aguenta o frio de junho e julho.",
          riskComparison: "Risco de geada cai de 30% (milho) para menos de 10% (trigo)."
        },
        {
          id: "milho_braquiaria_topo",
          title: "Opção B: Milho + Braquiária nas Encostas",
          tag: "Proteção do solo e maior renda",
          badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          schedule: "Semeadura imediata pós-soja até 10 de Fevereiro de 2027",
          plainExplanation: "Colheu a soja cedo em fevereiro, planta milho safrinha consorciado com capim braquiária apenas nas partes mais altas e encostas. A braquiária cria raízes fundas que seguram a água e evitam que a chuva lave a terra morro abaixo.",
          riskComparison: "Retém umidade por até 14 dias a mais em anos de seca (La Niña)."
        }
      ]
    },
    milho_verao: {
      cropName: "Milho Safra de Verão",
      status: "Em fase de desenvolvimento",
      harvestWindow: "Janeiro a Fevereiro de 2027",
      immediateAttention: "Boa cobertura do solo. Colheita antecipada permite planejar rotação de inverno sem pressa.",
      nextRotationOptions: [
        {
          id: "feijao_segunda",
          title: "Opção A: Feijão Segunda Safra (Cuidado Térmico)",
          tag: "Renda rápida, mas vulnerável",
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          schedule: "Semear até 20 de Fevereiro de 2027",
          plainExplanation: "Feijão cresce rápido, mas a flor queima facilmente se gear em maio. Só plante se tiver colheita prevista antes do dia 10 de maio.",
          riskComparison: "Sensível a geada. Indicado apenas para cotas altas (>720m)."
        },
        {
          id: "trigo_grao",
          title: "Opção B: Trigo para Moagem",
          tag: "Segurança total no inverno",
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          schedule: "Semear a partir de 25 de Abril de 2027",
          plainExplanation: "Permite descanso do solo após o milho e entrada com cereal de inverno resistente às massas de ar polar.",
          riskComparison: "Risco térmico mínimo nas baixadas frias."
        }
      ]
    },
    pousio: {
      cropName: "Área em Pousio / Cobertura",
      status: "Solo em descanso ou com palhada residual",
      harvestWindow: "Pronta para plantio imediato",
      immediateAttention: "Atenção à erosão por chuvas de verão! O solo não pode ficar exposto sem cobertura vegetal.",
      nextRotationOptions: [
        {
          id: "soja_tardia",
          title: "Opção A: Soja de Ciclo Curto",
          tag: "Janela limite de verão",
          badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          schedule: "Semeadura urgente até 30 de Novembro",
          plainExplanation: "Ainda está dentro do prazo para aproveitar a umidade de dezembro e colher no início do outono.",
          riskComparison: "Atrasar o plantio empurra a safrinha para o frio."
        }
      ]
    }
  };

  const selectedPlan = plans[currentPlanted as keyof typeof plans] || plans.soja;

  return (
    <Card className="border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-br from-blue-50/50 via-white to-zinc-50 dark:from-blue-950/20 dark:via-zinc-900/60 dark:to-zinc-900/40 backdrop-blur shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">
                  Planejamento Inteligente em Tempo Real
                </CardTitle>
                <Badge className="bg-blue-600 text-white border-none text-[11px] font-semibold px-2.5 py-0.5">
                  Safra 2026/27
                </Badge>
              </div>
              <CardDescription className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5 flex items-center gap-2">
                <Clock className="size-3.5 text-blue-600 dark:text-blue-400" />
                Data de referência: <strong>{currentDateFormatted}</strong> (Mês de {currentMonthName})
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Badge variant="outline" className="border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-500/10 text-[10px] gap-1 py-1">
              <Satellite className="size-3" /> Fonte: NASA POWER (MERRA-2)
            </Badge>
            <Badge variant="outline" className="border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-500/10 text-[10px] gap-1 py-1">
              <Database className="size-3" /> Fonte: ZARC 2026
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Step 1: User Simple Selection of Current Crop */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold items-center justify-center">1</span>
              O que está plantado no chão da fazenda hoje ({currentMonthName})?
            </span>
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
              Escolha fácil sem termos técnicos
            </span>
          </div>

          {/* Big friendly buttons for non-technical users */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "soja", name: "🌱 Soja de Verão", desc: "Plantada em Outubro/Novembro" },
              { id: "milho_verao", name: "🌽 Milho Safra Normal", desc: "Plantado em Setembro/Outubro" },
              { id: "pousio", name: "🌾 Terra em Descanso / Palhada", desc: "Aguardando próxima semeadura" }
            ].map((crop) => (
              <button
                key={crop.id}
                onClick={() => setCurrentPlanted(crop.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  currentPlanted === crop.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-400/40"
                    : "bg-zinc-50 dark:bg-zinc-950/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700"
                }`}
              >
                <div>
                  <span className="font-bold text-sm block">{crop.name}</span>
                  <span className={`text-xs mt-1 block ${currentPlanted === crop.id ? "text-blue-100" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {crop.desc}
                  </span>
                </div>
                {currentPlanted === crop.id && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold mt-2 text-white">
                    <CheckCircle2 className="size-3.5" /> Selecionado
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Diagnostic based on Current Date + NASA Climate Forecast */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-zinc-800 dark:text-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="size-4" /> Diagnóstico da Lavoura Atual ({selectedPlan.cropName})
            </span>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
              Fonte: Satélites NASA POWER + SMAP
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            {selectedPlan.immediateAttention}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-zinc-600 dark:text-zinc-400">
            <span>📅 <strong>Previsão de Colheita:</strong> {selectedPlan.harvestWindow}</span>
            <span>🛰️ <strong>Condição de Solo:</strong> Umidade satisfatória (&gt;65% na raiz)</span>
          </div>
        </div>

        {/* Step 3: Recommended Future Action Plan (Próximos Meses) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold items-center justify-center">2</span>
              O que fazer a seguir? Plano para os Próximos Meses (2027)
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="size-3" /> Recomendação do Algoritmo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPlan.nextRotationOptions.map((opt) => (
              <div
                key={opt.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={`text-xs font-semibold py-0.5 px-2.5 border ${opt.badgeColor}`}>
                      {opt.tag}
                    </Badge>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">ZARC Oficial</span>
                  </div>

                  <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                    {opt.title}
                  </h4>

                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
                      🗓️ Janela Recomendada: {opt.schedule}
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {opt.plainExplanation}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="size-4" /> {opt.riskComparison}
                  </span>
                  {onApplyPlan && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyPlan(opt.title)}
                      className="text-xs h-7 rounded-lg border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-white hover:bg-blue-600"
                    >
                      Aplicar ao Plano <ArrowRight className="size-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explain like I'm 5 banner (Linguagem para leigos) */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold flex items-center gap-1.5">
              💡 Dica simples para quem não é agrônomo:
            </span>
            <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              O ar frio da noite escorre morro abaixo como água e para no fundo da fazenda (a baixada). Por isso a geada sempre queima o milho lá embaixo primeiro. Nas baixadas, plante trigo. No alto, plante milho com braquiária!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
