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
      px="xs"
      pt="xs"
      style={{ borderStartStartRadius: "1.5rem", borderStartEndRadius: "1.5rem" }}
    >
      <Tabs
        variant="pills"
        value={active}
        onChange={(value) => {
          const target = options.find((option) => option.value === value);

          if (target) navigate(target.to);
        }}
      >
        <Tabs.List grow aria-label={ariaLabel} style={{ gap: "0.75rem" }}>
          {options.map((option, index) => {
            const isActive = option.value === active;

            return (
              <Tabs.Tab
                key={option.value}
                value={option.value}
                bg="transparent"
                bd={`2px solid ${isActive ? branding.colors.brand.primary : branding.colors.border.strong}`}
                c={isActive ? branding.colors.brand.primary : branding.colors.text.primary}
                fz="0.85rem"
                fw={500}
                p="0.7rem"
                style={{
                  borderStartStartRadius: index === 0 ? "1.25rem" : 0,
                  borderStartEndRadius: index === options.length - 1 ? "1.25rem" : 0,
                  borderEndStartRadius: 0,
                  borderEndEndRadius: 0,
                }}
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
