import type { RecordModel } from "pocketbase";

import type { MeshRecord } from "@/types/mesh.ts";

export type EntityTransformGroup = "pos" | "rotation" | "scale";

export type EntityTransformAxis = "x" | "y" | "z";

export type EntityTransformField = `${EntityTransformGroup}_${EntityTransformAxis}`;

export type EntityRecord = RecordModel &
  Record<EntityTransformField, number> & {
    slug: string;
    mesh: string;
    is_active: boolean;
    expand?: {
      mesh?: MeshRecord;
    };
  };

// Mantine's NumberInput reports the raw field content, not just numbers: "" when
// cleared, and partial input such as "-" or "1." mid-typing. Values are kept as
// typed and coerced once in toEntityPayload, so the field stays editable.
export type EntityTransformValue = number | string;

export type EntityFormValues = Record<EntityTransformField, EntityTransformValue> & {
  slug: string;
  mesh: string;
  is_active: boolean;
};

export type EntityFormErrors = Partial<Record<keyof EntityFormValues, string>>;

export type EntityMeshOption = {
  label: string;
  value: string;
};
