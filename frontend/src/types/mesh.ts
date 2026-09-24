import type { RecordModel } from "pocketbase";

export type MeshRecord = RecordModel & {
  name: string;
  description: string;
  file: string;
};

export type MeshFormValues = {
  name: string;
  description: string;
  file: File | null;
};

export type MeshCurrentFile = {
  name: string;
};
