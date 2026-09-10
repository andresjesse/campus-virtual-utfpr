import messages from "@/constants/messages.json";

export const MESH_IDENTIFIER_PATTERN = /^[a-z0-9_]+$/;

export function isValidMeshIdentifier(value: string) {
  return MESH_IDENTIFIER_PATTERN.test(value);
}

export function getMeshIdentifierError(value: string) {
  const name = value.trim();

  if (!name) {
    return messages.mesh.identifier.empty;
  }

  if (!isValidMeshIdentifier(name)) {
    return messages.mesh.identifier.invalid;
  }

  return undefined;
}