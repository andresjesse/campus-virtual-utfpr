import { Select, Stack } from "@mantine/core";

import SegmentedChoice from "@/components/segmented-choice/SegmentedChoice.tsx";
import messages from "@/constants/messages.json";
import type { MenuItemOption } from "@/types/menu.ts";

type MenuItemNestingFieldProps = {
  isNested: boolean;
  parent: string;
  parentOptions: MenuItemOption[];
  error?: string;
  onNestedChange: (isNested: boolean) => void;
  onParentBlur: () => void;
  onParentChange: (parentId: string) => void;
};

export default function MenuItemNestingField({
  isNested,
  parent,
  parentOptions,
  error,
  onNestedChange,
  onParentBlur,
  onParentChange,
}: MenuItemNestingFieldProps) {
  return (
    <Stack gap="xs">
      <SegmentedChoice
        withAsterisk
        label={messages.menuItems.editor.nestedLabel}
        options={[
          { value: "no", label: messages.menuItems.editor.nestedOptionNo },
          { value: "yes", label: messages.menuItems.editor.nestedOptionYes },
        ]}
        value={isNested ? "yes" : "no"}
        onChange={(value) => onNestedChange(value === "yes")}
      />

      {isNested && (
        <Select
          searchable
          placeholder={messages.menuItems.editor.parentPlaceholder}
          nothingFoundMessage={messages.menuItems.editor.parentNothingFound}
          data={parentOptions}
          value={parent || null}
          error={error}
          onBlur={onParentBlur}
          onChange={(parentId) => onParentChange(parentId ?? "")}
        />
      )}
    </Stack>
  );
}
