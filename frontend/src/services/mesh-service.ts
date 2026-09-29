import { MESH_COLLECTION } from "@/constants/mesh-constants.ts";
import { pocketbase } from "@/services/pocketbase.ts";
import type { MeshFormValues, MeshRecord } from "@/types/mesh";

export async function listMeshes(): Promise<MeshRecord[]> {
  return pocketbase
    .collection<MeshRecord>(MESH_COLLECTION)
    .getFullList({ requestKey: null, sort: "name" });
}

export async function getMesh(id: string) {
  return pocketbase
    .collection<MeshRecord>(MESH_COLLECTION)
    .getOne(id, { requestKey: null });
}

export async function createMesh(values: MeshFormValues) {
  return pocketbase
    .collection<MeshRecord>(MESH_COLLECTION)
    .create(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        file: values.file as File,
      },
      { requestKey: null },
    );
}

export async function updateMesh(id: string, values: MeshFormValues) {
  return pocketbase
    .collection<MeshRecord>(MESH_COLLECTION)
    .update(
      id,
      {
        name: values.name.trim(),
        description: values.description.trim(),
        ...(values.file ? { file: values.file } : {}),
      },
      { requestKey: null },
    );
}

export async function deleteMesh(id: string) {
  return pocketbase
    .collection<MeshRecord>(MESH_COLLECTION)
    .delete(id, { requestKey: null });
}