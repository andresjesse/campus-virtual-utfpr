import { Text } from "@mantine/core";

import { branding } from "@/config/branding";
import type { Branding } from "@/config/branding";

import classes from "./admin-brand.module.css";

type AdminBrandProps = {
  brand?: Branding;
};

export default function AdminBrand({ brand = branding }: AdminBrandProps) {
  return (
    <Text component="span" className={classes.brand} aria-label={brand.fullName}>
      {brand.assets.logo && (
        <img src={brand.assets.logo} alt="" className={classes.logo} />
      )}
      <span>{brand.organizationName}</span> {brand.productName}
    </Text>
  );
}
