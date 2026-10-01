import type { RecordModel } from "pocketbase";

import type { ContentPageRecord } from "@/types/content-page.ts";

export type MenuCategoryRecord = RecordModel & {
  label: string;
};

export type MenuCategoryFormValues = {
  label: string;
};

export type MenuItemRecord = RecordModel & {
  label: string;
  icon: string;
  href: string;
  page: string;
  parent: string;
  category: string;
  expand?: {
    category?: MenuCategoryRecord;
    page?: ContentPageRecord;
    parent?: MenuItemRecord;
  };
};

export type MenuItemLinkType = "link" | "page";

export type MenuItemFormValues = {
  label: string;
  linkType: MenuItemLinkType;
  href: string;
  page: string;
  isNested: boolean;
  parent: string;
  category: string;
  icon: File | null;
};

export type MenuItemFormErrors = Partial<Record<keyof MenuItemFormValues, string>>;

export type MenuItemOption = {
  label: string;
  value: string;
};

export type MenuItemPageOption = MenuItemOption & {
  disabled?: boolean;
  note?: string;
};

export type MenuItemCurrentIcon = {
  name: string;
  url: string;
};
