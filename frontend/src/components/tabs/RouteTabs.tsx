import { Box, Tabs } from "@mantine/core";
import { useNavigate } from "react-router";

import { branding } from "@/config/branding.ts";

export type RouteTabOption = {
  value: string;
  label: string;
  to: string;
};

type RouteTabsProps = {
  active: string;
  ariaLabel: string;
  options: RouteTabOption[];
};

export default function RouteTabs({ active, ariaLabel, options }: RouteTabsProps) {
  const navigate = useNavigate();

  return (
    <Box
      bg={branding.colors.surface.panel}
      px="lg"
      pt="lg"
      style={{ borderStartStartRadius: "1.5rem", borderStartEndRadius: "1.5rem" }}
    >
      <Tabs
        radius="md"
        variant="pills"
        value={active}
        onChange={(value) => {
          const target = options.find((option) => option.value === value);

          if (target) navigate(target.to);
        }}
      >
        <Tabs.List grow aria-label={ariaLabel} style={{ gap: "0.75rem" }}>
          {options.map((option) => {
            const isActive = option.value === active;

            return (
              <Tabs.Tab
                key={option.value}
                value={option.value}
                bg="transparent"
                bd={`1px solid ${isActive ? branding.colors.brand.primary : branding.colors.border.strong}`}
                c={isActive ? branding.colors.brand.primary : branding.colors.text.primary}
                fz="0.85rem"
                fw={500}
                p="0.7rem"
              >
                {option.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>
    </Box>
  );
}
