import { Select, Stack, Text } from "@mantine/core";
import { useContext } from "react";

import messages from "@/constants/messages.json";
import { DialogContext } from "@/contexts/dialog-context.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { MenuItemPageOption } from "@/types/menu.ts";

type MenuItemPageSelectProps = {
  options: MenuItemPageOption[];
  value: string;
  error?: string;
  onBlur: () => void;
  onChange: (pageId: string) => void;
};

export default function MenuItemPageSelect({
  options,
  value,
  error,
  onBlur,
  onChange,
}: MenuItemPageSelectProps) {
  const dialogBox = useContext(DialogContext);

  async function handleChange(pageId: string | null) {
    const selected = options.find((option) => option.value === pageId);

    if (!selected?.ownerLabel || !dialogBox) {
      onChange(pageId ?? "");
      return;
    }

    const confirmed = await dialogBox.confirm({
      title: messages.menuItems.editor.pageRelinkTitle,
      firstMessage: formatMessage(messages.menuItems.editor.pageRelinkFirst, {
        page: selected.label,
        item: selected.ownerLabel,
      }),
      secondMessage: formatMessage(messages.menuItems.editor.pageRelinkSecond, {
        item: selected.ownerLabel,
      }),
      confirmLabel: messages.menuItems.editor.pageRelinkConfirm,
      confirmColor: "brand",
    });

    if (confirmed) {
      onChange(selected.value);
    }
  }

  return (
    <Select
      searchable
      placeholder={messages.menuItems.editor.pagePlaceholder}
      nothingFoundMessage={messages.menuItems.editor.pageNothingFound}
      data={options}
      value={value || null}
      error={error}
      renderOption={({ option }) => {
        const { label, note } = option as MenuItemPageOption;

        return (
          <Stack gap={0}>
            <Text size="sm">{label}</Text>
            {note && (
              <Text size="xs" c="dimmed">
                {note}
              </Text>
            )}
          </Stack>
        );
      }}
      onBlur={onBlur}
      onChange={(pageId) => void handleChange(pageId)}
    />
  );
}
