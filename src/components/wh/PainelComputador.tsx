"use client";

import { IcGeada, IcMilho, IcSatelite, Logo } from "@/components/wh/Arte";
import { useT } from "@/lib/i18n";

/** Só em tela de computador: apresenta o projeto nos lados vazios, com o app (coluna de celular) no centro. */
export function PainelComputador({ link }: { link: string }) {
  const t = useT();
  const pontos: [React.ReactNode, string][] = [
    [<IcSatelite key="s" size={24} cor="#F2F5EE" />, t("45 safras de dados diários da NASA POWER (1981–2026), para qualquer município do Sul do Brasil.", "45 seasons of NASA POWER daily data (1981–2026), for any municipality in southern Brazil.")],
    [<IcGeada key="g" size={24} cor="#9CC3F0" />, t("Em quantas safras a geada e a seca pegaram a flor do milho, para cada data de plantio da soja.", "How many seasons frost and drought hit corn flowering, for each soybean planting date.")],
    [<IcMilho key="m" size={24} />, t("Calendário da safra e o que plantar depois da soja, do jeito que pesa para você.", "Season calendar and what to plant after soybeans, weighed by what matters to you.")],
  ];
  return (
    <>
      <aside
        aria-label={t("Sobre o weharvest", "About weharvest")}
        className="fixed inset-y-0 left-0 z-0 hidden w-[calc(50%-220px)] items-center justify-center bg-ceu px-6 text-claro lg:flex xl:px-10"
      >
        <div className="flex max-w-[400px] flex-col gap-4 xl:gap-6">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <div className="flex flex-col">
              <span className="text-[26px] font-black leading-none tracking-[-0.03em] xl:text-[32px]">weharvest</span>
              <span className="mt-1 font-mono text-xs tracking-[0.14em] text-broto">HOUSTON, WE HAVE A HARVEST</span>
            </div>
          </div>
          <p className="m-0 text-[22px] font-black leading-[1.15] tracking-[-0.02em] xl:text-[30px]">
            {t("Plante a soja na hora certa e proteja o milho safrinha.", "Plant soybeans on the right day and protect your second-crop corn.")}
          </p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {pontos.map(([icone, texto]) => (
              <li key={texto} className="flex items-start gap-3 rounded-2xl bg-ceu-2 p-3 text-sm leading-[1.45] text-claro-2 xl:p-3.5 xl:text-[15px]">
                <span className="flex size-10 flex-none items-center justify-center rounded-full bg-ceu">{icone}</span>
                {texto}
              </li>
            ))}
          </ul>
          <p className="m-0 text-sm leading-[1.5] text-claro-2">
            {t("Feito para o celular, no campo. Abra no seu: ", "Made for the phone, in the field. Open it on yours: ")}
            <a href={link} className="font-bold text-broto underline">
              {link.replace(/^https:\/\//, "").replace(/\/$/, "")}
            </a>
          </p>
        </div>
      </aside>
      <aside
        aria-hidden="true"
        className="fixed inset-y-0 right-0 z-0 hidden w-[calc(50%-220px)] items-center justify-center px-10 xl:flex"
      >
        <div className="flex max-w-[320px] flex-col gap-3 text-texto-2">
          <span className="font-mono text-xs tracking-[0.14em]">NASA SPACE APPS CHALLENGE 2026</span>
          <span className="text-lg font-black text-texto">{t("Desafio: Field Shift", "Challenge: Field Shift")}</span>
          <span className="text-[15px] leading-[1.5]">
            {t(
              "Adaptar a lavoura com dados da NASA. Apoio à decisão: não é previsão do tempo e não substitui o agrônomo.",
              "Adapting farms with NASA data. A decision aid: not a weather forecast, and not a replacement for the agronomist.",
            )}
          </span>
          <span className="text-sm leading-[1.5]">
            {t("Dados: NASA POWER · NOAA RONI · Open-Meteo · IBGE · Deral", "Data: NASA POWER · NOAA RONI · Open-Meteo · IBGE · Deral")}
          </span>
        </div>
      </aside>
    </>
  );
}
