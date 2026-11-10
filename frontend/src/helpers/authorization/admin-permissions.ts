import type { UserRecord } from "@/types/authentication.ts";

export type AdminCapability =
  | "pages.manage"
  | "menu.manage"
  | "entities.manage"
  | "meshes.manage";

const EDITOR_CAPABILITIES: AdminCapability[] = [
  "pages.manage",
  "menu.manage",
];

const ADMIN_CAPABILITIES: AdminCapability[] = [
  ...EDITOR_CAPABILITIES,
  "entities.manage",
  "meshes.manage",
];

export function getAdminCapabilities(
  user: UserRecord | null,
): AdminCapability[] {
  if (!user) {
    return [];
  }

  return user.is_admin ? ADMIN_CAPABILITIES : EDITOR_CAPABILITIES;
}

export function canAccessAdminCapability(
  user: UserRecord | null,
  capability: AdminCapability,
) {
  return getAdminCapabilities(user).includes(capability);
}
