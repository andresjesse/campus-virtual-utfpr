import {Button, Group, Modal, type ModalProps, Text} from "@mantine/core";

type DeletePageDialogProps = {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  opened: boolean;
  firstMessage?: string,
  secondMessage?: string,
} & ModalProps;

export default function DialogBox({
  loading,
  onCancel,
  onConfirm,
  opened,
  firstMessage,
  secondMessage
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
      <Text size="sm">{firstMessage}</Text>
      <Text size="xs" c="dimmed" mt="xs">{secondMessage}</Text>
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
