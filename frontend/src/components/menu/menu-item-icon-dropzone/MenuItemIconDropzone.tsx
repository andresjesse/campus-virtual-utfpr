import SingleFileDropzone from "@/components/file/SingleFileDropzone.tsx";
import {
  MENU_ITEM_ICON_ACCEPT,
  MENU_ITEM_ICON_MAX_SIZE_IN_BYTES,
} from "@/constants/menu-constants.ts";
import messages from "@/constants/messages.json";
import type { MenuItemCurrentIcon } from "@/types/menu.ts";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";

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
  return (
    <SingleFileDropzone
      value={value}
      accept={MENU_ITEM_ICON_ACCEPT}
      maxSizeInBytes={MENU_ITEM_ICON_MAX_SIZE_IN_BYTES}
      fileIcon={ImageIcon}
      labels={{
        dropzoneTitle: messages.menuItems.editor.dropzoneTitle,
        dropzoneDescription: messages.menuItems.editor.dropzoneDescription,
        removeLabel: messages.menuItems.editor.removeIconLabel,
        currentFileLabel: messages.menuItems.editor.currentIconLabel,
        replaceLabel: messages.menuItems.editor.replaceIconLabel,
        cancelReplaceLabel: messages.menuItems.editor.cancelReplaceIconLabel,
      }}
      currentFile={currentIcon}
      error={error}
      onChange={onChange}
    />
  );
}
