import type { RecordModel } from "pocketbase";

export type EntityRecord = RecordModel & {
  slug: string;
};

export type ContentPageRecord = RecordModel & {
  entity: string;
  expand?: {
    entity?: EntityRecord;
  };
  title: string;
};

export type ContentPageFormValues = {
  relation: string;
  title: string;
};

export type RelatedOption = {
  label: string;
  value: string;
};

export type RelatedType = "entity" | "menu_item";

export type ContentPageListRecord = ContentPageRecord & {
  relatedType: RelatedType | null;
};

export type MenuItemRecord = RecordModel & {
  label: string;
  page: string;
};
