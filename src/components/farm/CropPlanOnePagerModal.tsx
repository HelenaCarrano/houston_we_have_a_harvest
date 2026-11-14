"use client";

import React, { useRef } from "react";
import { FarmDetails } from "@/data/regions_data";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Share2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Mountain,
  Satellite
} from "lucide-react";

interface CropPlanOnePagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmDetails;
}

export function CropPlanOnePagerModal({ isOpen, onClose, farm }: CropPlanOnePagerModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `🌱 *GroundTruth - Plano de Safra 2026/27*\n📍 *Fazenda:* ${farm.name} (${farm.municipality})\n📊 *Recomendação:* Trigo nas baixadas (< 680m) contra geada e Milho+Braquiária nas encostas contra erosão e seca.\n🗓 *Janela ZARC:* Semear até 10/02 para milho e a partir de 15/04 para trigo.\n🛰 *Fonte:* 40 anos NASA POWER + Relevo SRTM 30m.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Action Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="size-4 text-emerald-400" />
              Plano de Safra GroundTruth (1 Página)
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Pronto para envio imediato no WhatsApp ou impressão pelo técnico de campo
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-zinc-700 text-zinc-300 hover:text-white text-xs gap-1 h-8"
            >
              <Printer className="size-3.5" /> Imprimir
            </Button>
            <Button
              size="sm"
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8 font-medium"
            >
              <Share2 className="size-3.5" /> Enviar WhatsApp
            </Button>
          </div>
        </div>

        {/* Printable One-Pager Document */}
        <div className="p-6 overflow-y-auto space-y-5 text-zinc-200" ref={printRef}>
          {/* Header Card */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white">GROUNDTRUTH</span>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                  NASA Space Apps 2026
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Adaptação Climática e Zoneamento Agronômico Orientado por Satélite
              </p>
            </div>

            <div className="text-right text-xs">
              <p className="font-semibold text-white">{farm.name}</p>
              <p className="text-zinc-400">{farm.municipality} • {farm.totalHectares} ha</p>
              <p className="text-[11px] text-zinc-400 font-mono">Lat: {farm.lat} | Lon: {farm.lon}</p>
            </div>
          </div>

          {/* Core Decision Summary */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="size-4" /> Recomendação Tática de Plantio
            </span>
            <p className="text-sm font-semibold text-white leading-relaxed">
              &quot;Plantar TRIGO de ciclo médio nas baixadas e MILHO consorciado com BRAQUIÁRIA nas encostas e topos.&quot;
            </p>
            <p className="text-xs text-zinc-300">
              <strong>Motivo Científico:</strong> A análise de 40 anos de satélites da NASA indica que a cada 10 anos, 3 registram temperaturas abaixo de zero nas baixadas por lago de ar frio. O trigo tolera geada na fase vegetativa, e a braquiária nas partes altas reduz perdas de umidade em anos de La Niña.
            </p>
          </div>

          {/* Microzoning Table */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 font-semibold text-xs text-zinc-300">
              Distribuição por Talhões da Propriedade (Relevo SRTM 30m)
            </div>
            <div className="divide-y divide-zinc-800 text-xs">
              <div className="p-3 grid grid-cols-12 gap-2 bg-zinc-950/40 items-center">
                <div className="col-span-3 font-semibold text-cyan-400 flex items-center gap-1">
                  <Mountain className="size-3.5" /> Baixada (65 ha)
                </div>
                <div className="col-span-3 text-zinc-400">Cota: 642 m - 680 m</div>
                <div className="col-span-3 text-red-400 font-medium">Risco Geada: Alto (3 em 10)</div>
                <div className="col-span-3 text-emerald-400 font-bold">Plantar: Trigo</div>
              </div>

              <div className="p-3 grid grid-cols-12 gap-2 bg-zinc-950/40 items-center">
                <div className="col-span-3 font-semibold text-amber-400 flex items-center gap-1">
                  <Mountain className="size-3.5" /> Encosta (75 ha)
                </div>
                <div className="col-span-3 text-zinc-400">Cota: 680 m - 720 m</div>
                <div className="col-span-3 text-amber-400 font-medium">Risco Erosão / Estiagem</div>
                <div className="col-span-3 text-amber-300 font-bold">Plantar: Milho + Braquiária</div>
              </div>

              <div className="p-3 grid grid-cols-12 gap-2 bg-zinc-950/40 items-center">
                <div className="col-span-3 font-semibold text-emerald-400 flex items-center gap-1">
                  <Mountain className="size-3.5" /> Topo (45 ha)
                </div>
                <div className="col-span-3 text-zinc-400">Cota: 720 m - 765 m</div>
                <div className="col-span-3 text-emerald-400 font-medium">Zona Térmica Segura</div>
                <div className="col-span-3 text-zinc-200 font-bold">Plantar: Milho Safrinha</div>
              </div>
            </div>
          </div>

          {/* Calendar & ZARC Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5 text-xs">
              <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                <Calendar className="size-4" /> Janelas Oficiais (ZARC)
              </span>
              <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                <li><strong>Milho Safrinha:</strong> Semeadura limite até <strong>10 de Fevereiro</strong></li>
                <li><strong>Trigo:</strong> Plantio a partir de <strong>15 de Abril a 20 de Maio</strong></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5 text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="size-4" /> O que Confirmar com o Agrônomo
              </span>
              <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                <li>Cultivar de trigo tolerante a giberela e ferrugem</li>
                <li>Manejo e dessecação da braquiária pré-soja</li>
                <li>Cotação futura e seguro paramétrico de safra</li>
              </ul>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-400 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1">
              <Satellite className="size-3 text-blue-400" />
              Fontes: NASA POWER (1981-2025), NASA SRTM (30m), MAPA ZARC, DERAL PR
            </span>
            <span>GroundTruth • Space Apps 2026</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
