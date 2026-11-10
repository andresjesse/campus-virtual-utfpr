import { ActionIcon, Group, Input, Select, Stack } from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useState } from "react";

import MenuCategoryQuickCreateModal from "@/components/menu/menu-category-quick-create-modal/MenuCategoryQuickCreateModal.tsx";
import messages from "@/constants/messages.json";
import type { MenuCategoryRecord, MenuItemOption } from "@/types/menu.ts";

type MenuItemCategoryFieldProps = {
  options: MenuItemOption[];
  value: string;
  error?: string;
  onBlur: () => void;
  onChange: (categoryId: string) => void;
  onCategoryCreated: (category: MenuCategoryRecord) => void;
};

export default function MenuItemCategoryField({
  options,
  value,
  error,
  onBlur,
  onChange,
  onCategoryCreated,
}: MenuItemCategoryFieldProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Stack gap={4}>
      <Group align="flex-end" gap="sm" wrap="nowrap">
        <Select
          searchable
          withAsterisk
          flex={1}
          label={messages.menuItems.editor.categoryLabel}
          placeholder={messages.menuItems.editor.categoryPlaceholder}
          nothingFoundMessage={messages.menuItems.editor.categoryNothingFound}
          data={options}
          value={value || null}
          error={Boolean(error)}
          onBlur={onBlur}
          onChange={(categoryId) => onChange(categoryId ?? "")}
        />
        <ActionIcon
          aria-label={messages.menuItems.editor.categoryCreateAriaLabel}
          variant="outline"
          color="brand"
          size="input-sm"
          onClick={() => setIsCreating(true)}
        >
          <PlusIcon aria-hidden size={16} />
        </ActionIcon>
      </Group>

      {error && <Input.Error>{error}</Input.Error>}

      <MenuCategoryQuickCreateModal
        opened={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={onCategoryCreated}
      />
    </Stack>
  );
}
