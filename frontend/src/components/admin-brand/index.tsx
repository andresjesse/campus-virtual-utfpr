import { Group, Image } from "@mantine/core";

import BrandText from "@/components/brand-text/BrandText.tsx";
import { branding, getBrandTitleParts } from "@/config/branding";
import type { Branding } from "@/config/branding";

type AdminBrandProps = {
  brand?: Branding;
};

export default function AdminBrand({ brand = branding }: AdminBrandProps) {
  return (
    <Group gap="xs" wrap="nowrap" aria-label={brand.fullName}>
      {brand.assets.logo && <Image src={brand.assets.logo} alt="" w="1.75rem" h="1.75rem" />}
      <BrandText
        parts={getBrandTitleParts(brand)}
        fz="clamp(1.35rem, 1.75vw, 1.8rem)"
        fw={700}
        lts="-0.04em"
        style={{ whiteSpace: "nowrap" }}
      />
    </Group>
  );
}
