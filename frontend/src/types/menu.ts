import type { RecordModel } from "pocketbase";

export type MenuCategoryRecord = RecordModel & {
  label: string;
};

export type MenuCategoryFormValues = {
  label: string;
};
