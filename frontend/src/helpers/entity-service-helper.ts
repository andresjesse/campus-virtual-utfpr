import {
  ENTITY_TRANSFORM_AXES,
  ENTITY_TRANSFORM_GROUPS,
} from "@/constants/entity-constants.ts";
import messages from "@/constants/messages.json";
import type {
  EntityFormErrors,
  EntityFormValues,
  EntityMeshOption,
  EntityRecord,
  EntityTransformField,
  EntityTransformValue,
} from "@/types/entity.ts";
import type { MeshRecord } from "@/types/mesh.ts";

// Lowercase words joined by a single hyphen or underscore, without leading or trailing
// separators: "ru_block", "main-entrance", "block_a2" are valid; "Block_A", "ru block",
// "_ru", "ru_" and "ru__block" are not.
export const ENTITY_SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export function isValidEntitySlug(value: string) {
  return ENTITY_SLUG_PATTERN.test(value);
}

export function getEntitySlugError(value: string) {
  const slug = value.trim();

  if (!slug) {
    return messages.entities.slug.empty;
  }

  if (!isValidEntitySlug(slug)) {
    return messages.entities.slug.invalid;
  }

  return undefined;
}

export function toEntityNumber(value: EntityTransformValue) {
  return typeof value === "number" ? value : Number(value);
}

export function getEntityTransformError(value: EntityTransformValue) {
  // An empty field must be caught before Number(), which turns "" into a finite 0.
  if (typeof value === "string" && !value.trim()) {
    return messages.entities.transform.required;
  }

  return Number.isFinite(toEntityNumber(value))
    ? undefined
    : messages.entities.transform.invalid;
}

export function getEntityTransformFields(): EntityTransformField[] {
  return ENTITY_TRANSFORM_GROUPS.flatMap((group) =>
    ENTITY_TRANSFORM_AXES.map((axis): EntityTransformField => `${group}_${axis}`),
  );
}

export function validateEntityForm(values: EntityFormValues): EntityFormErrors {
  const errors: EntityFormErrors = {};

  const slugError = getEntitySlugError(values.slug);
  if (slugError) {
    errors.slug = slugError;
  }

  if (!values.mesh) {
    errors.mesh = messages.entities.editor.meshRequiredError;
  }

  getEntityTransformFields().forEach((field) => {
    const transformError = getEntityTransformError(values[field]);
    if (transformError) {
      errors[field] = transformError;
    }
  });

  return errors;
}

export function toEntityFormValues(record: EntityRecord): EntityFormValues {
  const transforms = Object.fromEntries(
    getEntityTransformFields().map((field) => [field, record[field]]),
  ) as Record<EntityTransformField, EntityTransformValue>;

  return {
    ...transforms,
    slug: record.slug,
    mesh: record.mesh,
    is_active: Boolean(record.is_active),
  };
}

export function toEntityMeshOptions(meshes: MeshRecord[]): EntityMeshOption[] {
  return meshes.map((mesh) => ({
    label: mesh.name || messages.mesh.list.noIdentifier,
    value: mesh.id,
  }));
}
