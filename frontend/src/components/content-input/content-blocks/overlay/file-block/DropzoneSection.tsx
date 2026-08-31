import {Dropzone} from "@mantine/dropzone";
import {Group, Text} from "@mantine/core";
import {useHover} from "@mantine/hooks";
import {ImageIcon, UploadSimpleIcon, XIcon} from "@phosphor-icons/react";
import {useRef, useState} from "react";
import type {DragEvent} from "react";
import {FILE_BLOCK_MAX_SIZE_IN_BYTES, FILE_BLOCK_MIME_TYPES} from "@/constants/content-constants.ts";
import {branding} from "@/config/branding.ts";

type DropzonesSectionProps = {}

type DragStatus = 'none' | 'accept' | 'reject';

const getDragStatus = (event: DragEvent<HTMLElement>): DragStatus => {
  const items = event.dataTransfer?.items;
  if (!items || items.length === 0) return 'accept';
  for (let i = 0; i < items.length; i += 1) {
    const type = items[i].type;
    if (type && !FILE_BLOCK_MIME_TYPES.includes(type)) {
      return 'reject';
    }
  }
  return 'accept';
};

export default function DropzoneSection({}: DropzonesSectionProps) {
  const {hovered, ref} = useHover<HTMLDivElement>();
  const [dragActive, setDragActive] = useState(false);
  const [dragStatus, setDragStatus] = useState<DragStatus>('none');
  const dragDepth = useRef(0);

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    dragDepth.current += 1;
    setDragActive(true);
    setDragStatus(getDragStatus(event));
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    setDragStatus(getDragStatus(event));
  };

  const handleDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDragActive(false);
      setDragStatus('none');
    }
  };

  const handleDrop = () => {
    dragDepth.current = 0;
    setDragActive(false);
    setDragStatus('none');
  };

  const isHighlighted = hovered || dragActive;
  const showUpload = isHighlighted && dragStatus !== 'reject';
  const showReject = dragStatus === 'reject';
  const showImage = !isHighlighted;

  return (
    <Dropzone
      ref={ref}
      onDrop={(files) => {
        handleDrop();
        console.log('accepted files', files);
      }}
      onReject={(files) => {
        handleDrop();
        console.log('rejected files', files);
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      maxSize={FILE_BLOCK_MAX_SIZE_IN_BYTES}
      accept={FILE_BLOCK_MIME_TYPES}
      w="100%"
      pt="xl"
      pb="xl"
      bg={isHighlighted ? branding.colors.surface.interactiveHover : branding.colors.surface.interactive}
      bdrs={8}
      bd={`2px ${isHighlighted ? 'solid' : 'dotted'} ${branding.colors.border.default}`}
      ta='center'
      flex={1}
      style={{
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }}
    >
      <Group justify="center" gap="xl" style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: 42, height: 42 }}>
          <UploadSimpleIcon
            size={42}
            color="var(--mantine-color-blue-6)"
            style={{
              position: 'absolute',
              inset: 0,
              transition: 'opacity 150ms ease, transform 150ms ease',
              opacity: showUpload ? 1 : 0,
              transform: showUpload ? 'scale(1)' : 'scale(0.8)',
            }}
          />
          <XIcon
            size={42}
            color="var(--mantine-color-red-6)"
            style={{
              position: 'absolute',
              inset: 0,
              transition: 'opacity 150ms ease, transform 150ms ease',
              opacity: showReject ? 1 : 0,
              transform: showReject ? 'scale(1)' : 'scale(0.8)',
            }}
          />
          <ImageIcon
            size={42}
            color="var(--mantine-color-dimmed)"
            style={{
              position: 'absolute',
              inset: 0,
              transition: 'opacity 150ms ease, transform 150ms ease',
              opacity: showImage ? 1 : 0,
              transform: showImage ? 'scale(1)' : 'scale(0.8)',
            }}
          />
        </div>

        <div>
          <Text size="lg" inline>
            Arraste imagens aqui ou clique para selecionar arquivos
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Anexe quantas imagens quiser, cada uma não pode exceder 15MB
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}