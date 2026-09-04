import type { RecordModel } from "pocketbase";

export type ContentPageFormValues = {
  relation: string;
  title: string;
};

export type FileBlockContentValue = {
  newFiles: File[];
  deletedUrls: string[];
  urls: string[];
};

export type ContentPageBlockValue = string | FileBlockContentValue;

export type ContentPageBlockMetadata = {
  id?: string;
  title: string;
  collectionName: string;
  created?: string;
  updated?: string;
  page?: string;
}

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
  content?: ContentPageBlockValue;
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
