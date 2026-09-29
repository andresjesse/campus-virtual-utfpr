import { ENTITY_COLLECTION } from "@/constants/entity-constants.ts";
import {
  getEntityTransformFields,
  toEntityNumber,
} from "@/helpers/entity-service-helper.ts";
import { pocketbase } from "@/services/pocketbase.ts";
import type { EntityFormValues, EntityRecord } from "@/types/entity.ts";

function toEntityPayload(values: EntityFormValues) {
  const transforms = Object.fromEntries(
    getEntityTransformFields().map((field) => [field, toEntityNumber(values[field])]),
  );

  return {
    ...transforms,
    slug: values.slug.trim(),
    mesh: values.mesh,
    is_active: values.is_active,
  };
}

export async function listEntities(): Promise<EntityRecord[]> {
  return pocketbase
    .collection<EntityRecord>(ENTITY_COLLECTION)
    .getFullList({ expand: "mesh", requestKey: null, sort: "slug" });
}

export async function getEntity(id: string): Promise<EntityRecord> {
  return pocketbase
    .collection<EntityRecord>(ENTITY_COLLECTION)
    .getOne(id, { requestKey: null });
}

export async function createEntity(values: EntityFormValues): Promise<EntityRecord> {
  return pocketbase
    .collection<EntityRecord>(ENTITY_COLLECTION)
    .create(toEntityPayload(values), { requestKey: null });
}

export async function updateEntity(
  id: string,
  values: EntityFormValues,
): Promise<EntityRecord> {
  return pocketbase
    .collection<EntityRecord>(ENTITY_COLLECTION)
    .update(id, toEntityPayload(values), { requestKey: null });
}

export async function deleteEntity(id: string) {
  return pocketbase
    .collection<EntityRecord>(ENTITY_COLLECTION)
    .delete(id, { requestKey: null });
}
