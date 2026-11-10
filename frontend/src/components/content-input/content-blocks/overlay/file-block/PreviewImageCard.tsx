import {Box, Image} from "@mantine/core";
import {TrashIcon} from "@phosphor-icons/react/dist/csr/Trash";
import {useState} from "react";
import {branding} from "@/config/branding.ts";
import {FILE_PREVIEW_CARD_SIZE} from "@/constants/content-constants.ts";

type PreviewImageCardProps = {
  src: string;
  marked?: boolean;
  onToggle?: (src: string) => void;
  interactive: boolean;
}

export default function PreviewImageCard({ src, marked = false, onToggle, interactive }: PreviewImageCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      h={FILE_PREVIEW_CARD_SIZE}
      w={FILE_PREVIEW_CARD_SIZE}
      pos="relative"
      onMouseEnter={() => { if (interactive) setHovered(true) }}
      onMouseLeave={() => { if (interactive) setHovered(false) }}
      onClick={() => { if (interactive) onToggle?.(src) }}
      onKeyDown={(event) => {
        if (!interactive) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle?.(src);
        }
      }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-pressed={interactive && marked ? true : undefined}
      bdrs="md"
      bg={branding.colors.surface.interactive}
      bd={marked ? `2px solid ${branding.colors.feedback.error}` : "2px solid transparent"}
      style={{
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        transform: hovered ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 8px 20px rgba(0, 0, 0, 0.4)' : 'none',
      }}
    >
      <Image
        src={src}
        h="100%"
        w="100%"
        radius="md"
        fit="contain"
        draggable={false}
        style={{
          transition: 'opacity 150ms ease',
          opacity: marked ? 0.45 : 1,
          filter: hovered ? "blur(.8px)" : undefined,
        }}
      />

      <Box
        pos="absolute"
        inset={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'opacity 150ms ease',
          opacity: marked || hovered ? 1 : 0,
          background: 'transparent',
        }}
      >
        <TrashIcon
          aria-hidden
          size={28}
          weight={marked ? 'fill' : 'regular'}
          color={branding.colors.feedback.error}
        />
      </Box>
    </Box>
  );
}