import type { RecordModel } from "pocketbase";

export type ContentPageFormValues = {
  relation: string;
  title: string;
};

export type ContentPageBlockValue = string | string[];

export type ContentPageBlockMetadata = {
  id?: string;
  title: string;
  collectionName: string;
  created?: string;
  updated?: string;
  page?: string;
}

// TODO: Align this with the single source or truth on content-constants
export type GroupedContentPageBlockMetadata = {
  rtf_block?: ContentPageBlockMetadata[];
  diagram_block?: ContentPageBlockMetadata[];
  file_block?: ContentPageBlockMetadata[];
}

export type EntityRecord = RecordModel & {
  slug: string;
};

export type ContentPageBlockRecord = RecordModel & {
  id?: string;
  title?: string;
  content?: string | string[];
  created?: string;
  updated?: string;
  page?: string;
}

export type ContentPageRecord = RecordModel & {
  entity: string;
  expand?: {
    entity?: EntityRecord;
  };
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
