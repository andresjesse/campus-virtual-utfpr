import { Button, Group, Modal, Text } from "@mantine/core";

type DeletePageDialogProps = {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  opened: boolean;
  pageTitle?: string;
};

export default function DeletePageDialog({
  loading,
  onCancel,
  onConfirm,
  opened,
  pageTitle,
}: DeletePageDialogProps) {
  return (
    <Modal
      centered
      opened={opened}
      onClose={onCancel}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      title="Excluir página"
      size="sm"
    >
      <Text size="sm">
        Deseja excluir permanentemente a página “{pageTitle || "Sem título"}”?
      </Text>
      <Text size="xs" c="dimmed" mt="xs">
        Os blocos associados também serão removidos. Esta ação não pode ser desfeita.
      </Text>
      <Group justify="flex-end" mt="lg">
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          disabled={loading}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          size="xs"
          color="red"
          loading={loading}
          onClick={onConfirm}
        >
          Excluir
        </Button>
      </Group>
    </Modal>
  );
}
