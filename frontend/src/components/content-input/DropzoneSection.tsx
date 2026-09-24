import {Dropzone} from "@mantine/dropzone";
import {Button, Group, Stack, Text} from "@mantine/core";
import {useHover} from "@mantine/hooks";
import {notifications} from "@mantine/notifications";
import {UploadSimpleIcon, XIcon} from "@phosphor-icons/react";
import type {Icon} from "@phosphor-icons/react";
import {useRef, useState} from "react";
import type {DragEvent} from "react";
import type {FileRejection} from "react-dropzone";
import {
  buildFileRejectionNotification,
  getAcceptedMimeTypes,
  getDragStatus,
} from "@/helpers/file-helper.ts";
import type {DragStatus, DropzoneAccept} from "@/types/file.ts";
import {branding} from "@/config/branding.ts";

type DropzoneSectionProps = {
  onDrop: (files: File[]) => void;
  accept: DropzoneAccept;
  maxSizeInBytes: number;
  title: string;
  description: string;
  icon: Icon;
  multiple?: boolean;
  layout?: "inline" | "stacked";
  actionLabel?: string;
  error?: string;
}

type DragState = 'none' | DragStatus;

type DropzoneStatusIconProps = {
  idleIcon: Icon;
  size: number;
  idleColor: string;
  showUpload: boolean;
  showReject: boolean;
  showIdle: boolean;
}

const ICON_TRANSITION = 'opacity 150ms ease, transform 150ms ease';

const iconStyle = (visible: boolean) => ({
  position: 'absolute' as const,
  inset: 0,
  transition: ICON_TRANSITION,
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.8)',
});

function DropzoneStatusIcon({idleIcon: IdleIcon, size, idleColor, showUpload, showReject, showIdle}: DropzoneStatusIconProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <UploadSimpleIcon
        aria-hidden
        size={size}
        color={branding.colors.feedback.info}
        style={iconStyle(showUpload)}
      />
      <XIcon
        aria-hidden
        size={size}
        color={branding.colors.feedback.error}
        style={iconStyle(showReject)}
      />
      <IdleIcon
        aria-hidden
        size={size}
        color={idleColor}
        style={iconStyle(showIdle)}
      />
    </div>
  );
}

export default function DropzoneSection({
  onDrop,
  accept,
  maxSizeInBytes,
  title,
  description,
  icon,
  multiple = true,
  layout = "inline",
  actionLabel,
  error,
}: DropzoneSectionProps) {
  const {hovered, ref} = useHover<HTMLDivElement>();
  const [dragActive, setDragActive] = useState(false);
  const [dragState, setDragState] = useState<DragState>('none');
  const dragDepth = useRef(0);
  const openRef = useRef<() => void>(null);

  const acceptedMimeTypes = getAcceptedMimeTypes(accept);
  const isStacked = layout === "stacked";

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    dragDepth.current += 1;
    setDragActive(true);
    setDragState(getDragStatus(event.dataTransfer?.items, acceptedMimeTypes));
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    setDragState(getDragStatus(event.dataTransfer?.items, acceptedMimeTypes));
  };

  const handleDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDragActive(false);
      setDragState('none');
    }
  };

  const resetDropState = () => {
    dragDepth.current = 0;
    setDragActive(false);
    setDragState('none');
  };

  const handleAcceptedDrop = (files: File[]) => {
    resetDropState()
    onDrop(files);
  }

  const handleRejectedDrop = (fileRejections: FileRejection[]) => {
    resetDropState();
    notifications.show(
      buildFileRejectionNotification(fileRejections, {
        maxSizeInBytes,
        allowedMimeTypes: acceptedMimeTypes,
      }),
    );
  }

  const isHighlighted = hovered || dragActive;
  // The stacked layout has an explicit action button, so hovering alone shouldn't swap its icon.
  const isIconActive = isStacked ? dragActive : isHighlighted;
  const showReject = dragState === 'reject';
  const showUpload = isIconActive && !showReject;
  const showIdle = !isIconActive;

  const statusIcon = (
    <DropzoneStatusIcon
      idleIcon={icon}
      size={isStacked ? 62 : 42}
      idleColor={isStacked ? branding.colors.text.primary : branding.colors.text.muted}
      showUpload={showUpload}
      showReject={showReject}
      showIdle={showIdle}
    />
  );

  return (
    <>
    <Dropzone
      ref={ref}
      onDrop={handleAcceptedDrop}
      onReject={handleRejectedDrop}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      openRef={openRef}
      // Stacked has its own button; a root click would open the dialog a second time.
      activateOnClick={!isStacked}
      // The inner wrapper must fill the fixed height for the stacked content to be centered.
      styles={isStacked ? { inner: { height: "100%" } } : undefined}
      maxSize={maxSizeInBytes}
      accept={accept}
      multiple={multiple}
      w="100%"
      h={isStacked ? 326 : undefined}
      pt={isStacked ? undefined : "xl"}
      pb={isStacked ? undefined : "xl"}
      px={isStacked ? "xl" : undefined}
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
      {isStacked ? (
        <Stack align="center" justify="center" gap="sm" h="100%">
          {statusIcon}
          <Text size="lg" fw={700}>
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
          {actionLabel && (
            <Button
              color={branding.colors.feedback.info}
              size="md"
              radius="xl"
              mt="sm"
              onClick={() => openRef.current?.()}
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      ) : (
        <Group justify="center" gap="xl" style={{ pointerEvents: 'none' }}>
          {statusIcon}
          <div>
            <Text size="lg" inline>
              {title}
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              {description}
            </Text>
          </div>
        </Group>
      )}
    </Dropzone>
    <Text
      c={branding.colors.feedback.error}
      size="sm"
      mt="xs"
      aria-hidden={!error}
      style={{ visibility: error ? 'visible' : 'hidden' }}
    >
      {error ?? ' '}
    </Text>
    </>
  );
}
