import {Box, Image} from "@mantine/core";
import {TrashIcon} from "@phosphor-icons/react/dist/csr/Trash";
import {useState} from "react";
import {branding} from "@/config/branding.ts";

type PreviewImageCardProps = {
  src: string;
  marked: boolean;
  onToggle: (src: string) => void;
}

export default function PreviewImageCard({ src, marked, onToggle }: PreviewImageCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      h={120}
      w={120}
      pos="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onToggle(src)}
      bdrs="md"
      style={{
        cursor: 'pointer',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        transform: hovered ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 8px 20px rgba(0, 0, 0, 0.4)' : 'none',
        border: `2px solid ${marked ? branding.colors.feedback.error : 'transparent'}`,
        backgroundColor: `${branding.colors.surface.interactive}`
      }}
    >
      <Image
        src={src}
        h="100%"
        w="100%"
        radius="sm"
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