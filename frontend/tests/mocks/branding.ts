import type { Branding } from "@/config/branding";

export function auroraBrand(): Branding {
  const actual = jest.requireActual<typeof import("@/config/branding")>(
    "@/config/branding",
  );

  return {
    ...actual.branding,
    organizationName: "Aurora",
    productName: "Portal",
    fullName: "Aurora Portal",
    storageNamespace: "aurora-portal",
    assets: {
      ...actual.branding.assets,
      loginBackground: "/branding/aurora-background.webp",
      logo: "/branding/aurora-logo.svg",
    },
    colors: {
      ...actual.branding.colors,
      brand: {
        ...actual.branding.colors.brand,
        primary: "#6650a4",
        palette: [
          "#e9e3f7",
          "#d9cdf1",
          "#c3afe6",
          "#a98bd8",
          "#8f68ca",
          "#6650a4",
          "#5a468f",
          "#4c3a77",
          "#3f2f60",
          "#33264f",
        ],
      },
    },
  };
}

export function mockBrandingModule() {
  return {
    branding: auroraBrand(),
    getStorageKey: jest.requireActual<typeof import("@/config/branding")>(
      "@/config/branding",
    ).getStorageKey,
  };
}
