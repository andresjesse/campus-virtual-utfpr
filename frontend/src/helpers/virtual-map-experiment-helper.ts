/**
 * Opções gráficas ativadas por URL (`?exp=noaa,dpr1`) para os experimentos de desempenho.
 * Sem o parâmetro, todas ficam desativadas e o mapa se comporta como o padrão.
 */
export type VirtualMapExperiment = {
  noShadow: boolean;
  staticShadow: boolean;
  shadowMapSize: number | null;
  noAntialias: boolean;
  pixelRatioOne: boolean;
  pixelRatioOneHalf: boolean;
  onDemand: boolean;
};

export const DEFAULT_VIRTUAL_MAP_EXPERIMENT: VirtualMapExperiment = {
  noShadow: false,
  staticShadow: false,
  shadowMapSize: null,
  noAntialias: false,
  pixelRatioOne: false,
  pixelRatioOneHalf: false,
  onDemand: false,
};

export function parseVirtualMapExperiment(search: string): VirtualMapExperiment {
  const flags = new Set((new URLSearchParams(search).get("exp") ?? "").split(",").map((flag) => flag.trim()));

  return {
    noShadow: flags.has("noshadow"),
    staticShadow: flags.has("staticshadow"),
    shadowMapSize: flags.has("shadow1024") ? 1024 : null,
    noAntialias: flags.has("noaa"),
    pixelRatioOne: flags.has("dpr1"),
    pixelRatioOneHalf: flags.has("dpr15"),
    onDemand: flags.has("ondemand"),
  };
}
