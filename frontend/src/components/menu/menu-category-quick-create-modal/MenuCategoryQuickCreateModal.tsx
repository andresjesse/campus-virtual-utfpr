import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useState } from "react";

import messages from "@/constants/messages.json";
import { getMenuCategoryLabelError } from "@/helpers/menu-category-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { createMenuCategory } from "@/services/menu-category-service.ts";
import type { MenuCategoryRecord } from "@/types/menu.ts";

type MenuCategoryQuickCreateModalProps = {
  opened: boolean;
  onClose: () => void;
  onCreated: (category: MenuCategoryRecord) => void;
};

export default function MenuCategoryQuickCreateModal({
  opened,
  onClose,
  onCreated,
}: MenuCategoryQuickCreateModalProps) {
  const [label, setLabel] = useState("");
  const [labelTouched, setLabelTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const validationError = labelTouched ? getMenuCategoryLabelError(label) : undefined;

  function handleClose() {
    setLabel("");
    setLabelTouched(false);
    setServerError("");
    onClose();
  }

  async function handleCreate() {
    setLabelTouched(true);

    if (getMenuCategoryLabelError(label)) return;

    setIsSaving(true);

    try {
      onCreated(await createMenuCategory({ label }));
      handleClose();
    } catch (createError) {
      setServerError(
        getRequestErrorMessage(createError, messages.menuCategories.errors),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      centered
      size="sm"
      opened={opened}
      title={messages.menuCategories.editor.newTitle}
      onClose={handleClose}
    >
      <Stack gap="md">
        <TextInput
          withAsterisk
          data-autofocus
          label={messages.menuCategories.editor.labelLabel}
          placeholder={messages.menuCategories.editor.labelPlaceholder}
          value={label}
          error={validationError ?? serverError}
          onBlur={() => setLabelTouched(true)}
          onChange={(event) => {
            setServerError("");
            setLabel(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;

            event.preventDefault();
            void handleCreate();
          }}
        />
        <Group justify="flex-end">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            disabled={isSaving}
            onClick={handleClose}
          >
            {messages.common.cancel}
          </Button>
          <Button
            color="brand"
            size="xs"
            loading={isSaving}
            onClick={() => void handleCreate()}
          >
            {messages.common.save}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
