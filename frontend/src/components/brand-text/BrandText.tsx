import { Text, type TextProps } from "@mantine/core";
import { Fragment } from "react";

import { branding, type BrandingTextPart } from "@/config/branding.ts";

type BrandTextProps = TextProps & {
  parts: BrandingTextPart[];
};

export default function BrandText({ parts, ...props }: BrandTextProps) {
  return (
    <Text component="span" c={branding.colors.text.muted} {...props}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <Text
            component="span"
            inherit
            c={part.highlighted ? branding.colors.brand.primary : undefined}
          >
            {part.text}
          </Text>
        </Fragment>
      ))}
    </Text>
  );
}
