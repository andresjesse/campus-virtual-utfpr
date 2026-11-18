import { Box, Center, Popover } from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

import VirtualMapTourCard from "@/components/virtual-map/virtual-map-tour/VirtualMapTourCard.tsx";
import VirtualMapTourMask from "@/components/virtual-map/virtual-map-tour/VirtualMapTourMask.tsx";
import messages from "@/constants/messages.json";
import type { VirtualMapTourTarget } from "@/constants/virtual-map-tour-constants.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import { getTourSpotlight, getTourTargetSelector } from "@/helpers/virtual-map-tour-helper.ts";
import { useVirtualMapTour } from "@/hooks/use-virtual-map-tour.ts";
import type { VirtualMapTourRect } from "@/types/virtual-map-tour.ts";

type VirtualMapTourProps = {
  enabled: boolean;
};

type MeasuredTarget = {
  target: VirtualMapTourTarget;
  rect: VirtualMapTourRect;
};

export default function VirtualMapTour({ enabled }: VirtualMapTourProps) {
  const { isOpen, step, stepIndex, total, isFirst, isLast, target, next, back, close } =
    useVirtualMapTour(enabled);
  const isTouch = useMediaQuery("(pointer: coarse)");
  const viewport = useViewportSize();
  const cardRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<MeasuredTarget | null>(null);

  useEffect(() => {
    if (!isOpen || !target) return;
    const element = document.querySelector(getTourTargetSelector(target));
    if (!element) return;

    const measure = () => {
      const { top, left, width, height } = element.getBoundingClientRect();
      setMeasured({ target, rect: { top, left, width, height } });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isOpen, target]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (cardRef.current?.contains(event.target as Node)) return;
      close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const copy = messages.virtualMap.tour.steps[step];
  const body = isTouch && "touchBody" in copy ? copy.touchBody : copy.body;
  const targetRect = measured && measured.target === target ? measured.rect : null;
  const spotlight = getTourSpotlight(targetRect, viewport, 8);
  const counter = formatMessage(messages.virtualMap.tour.stepCounter, {
    current: String(stepIndex + 1),
    total: String(total),
  });

  const card = (
    <VirtualMapTourCard
      ref={cardRef}
      counter={counter}
      title={copy.title}
      body={body}
      isFirst={isFirst}
      isLast={isLast}
      onBack={back}
      onNext={next}
      onSkip={close}
    />
  );

  return (
    <>
      <VirtualMapTourMask viewport={viewport} spotlight={spotlight} />
      {spotlight ? (
        <Popover
          opened
          position="bottom"
          offset={12}
          zIndex={301}
          trapFocus={false}
          closeOnEscape={false}
          closeOnClickOutside={false}
        >
          <Popover.Target>
            <Box
              pos="fixed"
              top={spotlight.top}
              left={spotlight.left}
              w={spotlight.width}
              h={spotlight.height}
              style={{ pointerEvents: "none" }}
            />
          </Popover.Target>
          <Popover.Dropdown p={0} bd="none" bg="transparent">
            {card}
          </Popover.Dropdown>
        </Popover>
      ) : (
        <Center
          pos="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100dvh"
          style={{ zIndex: 301, pointerEvents: "none" }}
        >
          <Box style={{ pointerEvents: "auto" }}>{card}</Box>
        </Center>
      )}
    </>
  );
}
