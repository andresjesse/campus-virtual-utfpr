import {
  DEFAULT_VIRTUAL_MAP_EXPERIMENT,
  parseVirtualMapExperiment,
} from "@/helpers/virtual-map-experiment-helper.ts";

describe("parseVirtualMapExperiment", () => {
  it("mantém o comportamento padrão sem o parâmetro", () => {
    expect(parseVirtualMapExperiment("")).toEqual(DEFAULT_VIRTUAL_MAP_EXPERIMENT);
    expect(parseVirtualMapExperiment("?outro=1")).toEqual(DEFAULT_VIRTUAL_MAP_EXPERIMENT);
  });

  it("ativa as opções combinadas por vírgula", () => {
    expect(parseVirtualMapExperiment("?exp=staticshadow,noaa,dpr1")).toEqual({
      ...DEFAULT_VIRTUAL_MAP_EXPERIMENT,
      staticShadow: true,
      noAntialias: true,
      pixelRatioOne: true,
    });
  });

  it("reconhece sombra reduzida, sem sombra e renderização sob demanda", () => {
    expect(parseVirtualMapExperiment("?exp=shadow1024").shadowMapSize).toBe(1024);
    expect(parseVirtualMapExperiment("?exp=noshadow").noShadow).toBe(true);
    expect(parseVirtualMapExperiment("?exp=ondemand").onDemand).toBe(true);
    expect(parseVirtualMapExperiment("?exp=dpr15").pixelRatioOneHalf).toBe(true);
  });
});
