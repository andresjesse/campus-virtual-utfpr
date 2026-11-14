import { Button, FocusTrap, Group, Paper, Text, Title } from "@mantine/core";
import { useId } from "react";
import type { Ref } from "react";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";

type VirtualMapTourCardProps = {
  ref?: Ref<HTMLDivElement>;
  counter: string;
  title: string;
  body: string;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export default function VirtualMapTourCard({
  ref,
  counter,
  title,
  body,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSkip,
}: VirtualMapTourCardProps) {
  const titleId = useId();
  const bodyId = useId();

  return (
    <FocusTrap active>
      <Paper
        ref={ref}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        w={360}
        maw="calc(100vw - 2rem)"
        p="lg"
        radius="lg"
        bg={branding.colors.surface.panel}
        c={branding.colors.text.primary}
        bd={`1px solid ${branding.colors.brand.primary}`}
      >
        <Text size="xs" fw={700} tt="uppercase" lts="0.1em" c={branding.colors.text.muted}>
          {counter}
        </Text>
        <Title id={titleId} order={2} size="h4" mt={4}>
          {title}
        </Title>
        <Text id={bodyId} size="sm" mt="xs">
          {body}
        </Text>
        <Group justify="space-between" mt="lg" wrap="nowrap">
          <Button variant="subtle" color="gray" onClick={onSkip}>
            {messages.common.skip}
          </Button>
          <Group gap="xs" wrap="nowrap">
            {!isFirst && (
              <Button variant="default" onClick={onBack}>
                {messages.common.back}
              </Button>
            )}
            <Button data-autofocus onClick={onNext}>
              {isLast ? messages.common.finish : messages.common.next}
            </Button>
          </Group>
        </Group>
      </Paper>
    </FocusTrap>
  );
}
