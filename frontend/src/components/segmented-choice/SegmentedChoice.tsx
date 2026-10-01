import { Input, SegmentedControl } from "@mantine/core";

import { branding } from "@/config/branding.ts";

export type SegmentedChoiceOption = {
  label: string;
  value: string;
};

type SegmentedChoiceProps = {
  label: string;
  options: SegmentedChoiceOption[];
  value: string;
  error?: string;
  withAsterisk?: boolean;
  onChange: (value: string) => void;
};

export default function SegmentedChoice({
  label,
  options,
  value,
  error,
  withAsterisk,
  onChange,
}: SegmentedChoiceProps) {
  return (
    <Input.Wrapper label={label} error={error} withAsterisk={withAsterisk}>
      <SegmentedControl
        fullWidth
        aria-label={label}
        data={options}
        value={value}
        bg={branding.colors.surface.interactiveHover}
        color={branding.colors.surface.page}
        onChange={onChange}
      />
    </Input.Wrapper>
  );
}
