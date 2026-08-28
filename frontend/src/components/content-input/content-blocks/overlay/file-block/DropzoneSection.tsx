import {Dropzone} from "@mantine/dropzone";
import {Group, Text} from "@mantine/core";
import {ImageIcon, UploadSimpleIcon, XIcon} from "@phosphor-icons/react";
import {FILE_BLOCK_MAX_SIZE_IN_BYTES, FILE_BLOCK_MIME_TYPES} from "@/constants/content-constants.ts";
import {branding} from "@/config/branding.ts";

type DropzonesSectionProps = {}

export default function DropzoneSection({}: DropzonesSectionProps) {
  return (
    <Dropzone
      onDrop={(files) => console.log('accepted files', files)}
      onReject={(files) => console.log('rejected files', files)}
      maxSize={FILE_BLOCK_MAX_SIZE_IN_BYTES}
      accept={FILE_BLOCK_MIME_TYPES}
      w="100%"
      pt="xl"
      pb="xl"
      bg={branding.colors.surface.interactive}
      bdrs={8}
      bd={`2px dotted ${branding.colors.border.default}`}
      ta='center'
      flex={1}
    >
      <Group justify="center" gap="xl" style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <UploadSimpleIcon size={42} color="var(--mantine-color-blue-6)" />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <XIcon size={42} color="var(--mantine-color-red-6)" />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <ImageIcon size={42} color="var(--mantine-color-dimmed)" />
        </Dropzone.Idle>

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