import { Text } from "@mantine/core";

import classes from "./admin-brand.module.css";

export default function AdminBrand() {
  return (
    <Text component="span" className={classes.brand} aria-label="UTFPR Virtual">
      <span>UTFPR</span> Virtual
    </Text>
  );
}
