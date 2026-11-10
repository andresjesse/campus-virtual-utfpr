import { Group } from "@mantine/core";

import BrandText from "@/components/brand-text/BrandText.tsx";
import { branding, getBrandTitleParts } from "@/config/branding.ts";
import type { Branding } from "@/config/branding.ts";

type VirtualMapMenuHeaderProps = {
  brand?: Branding;
};

export default function VirtualMapMenuHeader({ brand = branding }: VirtualMapMenuHeaderProps) {
  return (
    <Group justify="space-between" gap="sm" mb="xl">
      <BrandText
        parts={getBrandTitleParts(brand)}
        fz="xl"
        fw={700}
        style={{
          textShadow: `0 2px 10px color-mix(in srgb, ${branding.colors.surface.shadow} 60%, transparent)`,
        }}
      />
      {brand.location.length > 0 && (
        <BrandText
          parts={brand.location}
          fz="xl"
          fw={700}
          style={{
            textShadow: `0 2px 10px color-mix(in srgb, ${branding.colors.surface.shadow} 60%, transparent)`,
          }}
        />
      )}
    </Group>
  );
}
