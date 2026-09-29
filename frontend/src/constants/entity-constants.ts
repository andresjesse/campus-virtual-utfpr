import type {
  EntityTransformAxis,
  EntityTransformField,
  EntityTransformGroup,
  EntityTransformValue,
} from "@/types/entity.ts";

export const ENTITY_COLLECTION = "entities";

export const ENTITY_TRANSFORM_GROUPS: readonly EntityTransformGroup[] = [
  "pos",
  "rotation",
  "scale",
];

export const ENTITY_TRANSFORM_AXES: readonly EntityTransformAxis[] = ["x", "y", "z"];

export const ENTITY_TRANSFORM_STEP = 0.1;

export const ENTITY_TRANSFORM_DECIMAL_SCALE = 3;

export const ENTITY_DEFAULT_TRANSFORM: Record<EntityTransformField, EntityTransformValue> = {
  pos_x: 0,
  pos_y: 0,
  pos_z: 0,
  rotation_x: 0,
  rotation_y: 0,
  rotation_z: 0,
  scale_x: 1,
  scale_y: 1,
  scale_z: 1,
};
