import { ActionIcon, Button } from "@mantine/core";
import { useState } from "react";

import DropzoneSection from "@/components/content-input/DropzoneSection.tsx";
import FileCard from "@/components/file/FileCard.tsx";
import {
  MENU_ITEM_ICON_ACCEPT,
  MENU_ITEM_ICON_MAX_SIZE_IN_BYTES,
} from "@/constants/menu-constants.ts";
import messages from "@/constants/messages.json";
import { formatFileSize } from "@/helpers/conversion-helper.ts";
import type { MenuItemCurrentIcon } from "@/types/menu.ts";
import { CloudArrowUpIcon } from "@phosphor-icons/react/dist/csr/CloudArrowUp";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type MenuItemIconDropzoneProps = {
  value: File | null;
  currentIcon?: MenuItemCurrentIcon;
  error?: string;
  onChange: (file: File | null) => void;
};

export default function MenuItemIconDropzone({
  value,
  currentIcon,
  error,
  onChange,
}: MenuItemIconDropzoneProps) {
  const [isReplacing, setIsReplacing] = useState(false);

  if (value) {
    return (
      <FileCard
        icon={ImageIcon}
        title={value.name}
        subtitle={formatFileSize(value.size)}
        action={
          <ActionIcon
            aria-label={messages.menuItems.editor.removeIconLabel}
            color="red"
            variant="subtle"
            size="sm"
            onClick={() => {
              setIsReplacing(false);
              onChange(null);
            }}
          >
            <XIcon aria-hidden size={15} />
          </ActionIcon>
        }
      />
    );
  }

  if (currentIcon && !isReplacing) {
    return (
      <FileCard
        icon={ImageIcon}
        title={currentIcon.name}
        subtitle={messages.menuItems.editor.currentIconLabel}
        action={
          <Button variant="subtle" color="gray" size="xs" onClick={() => setIsReplacing(true)}>
            {messages.menuItems.editor.replaceIconLabel}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DropzoneSection
        layout="stacked"
        multiple={false}
        onDrop={(files) => onChange(files[0] ?? null)}
        accept={MENU_ITEM_ICON_ACCEPT}
        maxSizeInBytes={MENU_ITEM_ICON_MAX_SIZE_IN_BYTES}
        icon={CloudArrowUpIcon}
        title={messages.menuItems.editor.dropzoneTitle}
        description={messages.menuItems.editor.dropzoneDescription}
        actionLabel={messages.common.selectFiles}
        error={error}
      />
      {currentIcon && (
        <Button variant="outline" color="brand" size="xs" onClick={() => setIsReplacing(false)}>
          {messages.menuItems.editor.cancelReplaceIconLabel}
        </Button>
      )}
    </>
  );
}
