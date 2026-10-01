import {Button, Group, Modal, Text} from "@mantine/core";
import type { DialogPropsValue } from "@/types/user-feedback.ts";
import messages from "@/constants/messages.json";

export default function DialogBox({
  loading,
  onCancel,
  onConfirm,
  opened,
  firstMessage,
  secondMessage,
  confirmLabel,
  confirmColor,
  title
}: DialogPropsValue) {
  return (
    <Modal
      centered
      opened={opened}
      onClose={onCancel}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      title={title}
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
          {messages.common.cancel}
        </Button>
        <Button
          size="xs"
          color={confirmColor ?? "red"}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel ?? messages.common.delete}
        </Button>
      </Group>
    </Modal>
  );
}
