import { Stack, Text, TextInput } from "@mantine/core";

import MenuItemPageSelect from "@/components/menu/menu-item-page-select/MenuItemPageSelect.tsx";
import SegmentedChoice from "@/components/segmented-choice/SegmentedChoice.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import type { MenuItemLinkType, MenuItemPageOption } from "@/types/menu.ts";

type MenuItemLinkFieldProps = {
  linkType: MenuItemLinkType | "";
  href: string;
  page: string;
  pageOptions: MenuItemPageOption[];
  linkTypeError?: string;
  hrefError?: string;
  pageError?: string;
  onLinkTypeChange: (linkType: MenuItemLinkType) => void;
  onHrefBlur: () => void;
  onHrefChange: (href: string) => void;
  onPageBlur: () => void;
  onPageChange: (pageId: string) => void;
};

export default function MenuItemLinkField({
  linkType,
  href,
  page,
  pageOptions,
  linkTypeError,
  hrefError,
  pageError,
  onLinkTypeChange,
  onHrefBlur,
  onHrefChange,
  onPageBlur,
  onPageChange,
}: MenuItemLinkFieldProps) {
  return (
    <Stack gap="xs">
      <SegmentedChoice
        withAsterisk
        label={messages.menuItems.editor.linkLabel}
        options={[
          { value: "link", label: messages.menuItems.editor.linkOptionLink },
          { value: "page", label: messages.menuItems.editor.linkOptionPage },
          { value: "none", label: messages.menuItems.editor.linkOptionNone },
        ]}
        value={linkType}
        error={linkTypeError}
        onChange={(value) => onLinkTypeChange(value as MenuItemLinkType)}
      />

      {linkType === "link" && (
        <TextInput
          placeholder={messages.menuItems.editor.hrefPlaceholder}
          value={href}
          error={hrefError}
          onBlur={onHrefBlur}
          onChange={(event) => onHrefChange(event.currentTarget.value)}
        />
      )}

      {linkType === "page" && (
        <MenuItemPageSelect
          options={pageOptions}
          value={page}
          error={pageError}
          onBlur={onPageBlur}
          onChange={onPageChange}
        />
      )}

      {linkType === "none" && (
        <Text size="sm" c={branding.colors.feedback.warning}>
          {messages.menuItems.editor.noTargetNotice}
        </Text>
      )}
    </Stack>
  );
}
