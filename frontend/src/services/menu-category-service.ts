import { MENU_CATEGORY_COLLECTION } from "@/constants/menu-constants.ts";
import { pocketbase } from "@/services/pocketbase.ts";
import type { MenuCategoryFormValues, MenuCategoryRecord } from "@/types/menu";

export async function listMenuCategories(): Promise<MenuCategoryRecord[]> {
  return pocketbase
    .collection<MenuCategoryRecord>(MENU_CATEGORY_COLLECTION)
    .getFullList({ requestKey: null, sort: "label" });
}

export async function getMenuCategory(id: string) {
  return pocketbase
    .collection<MenuCategoryRecord>(MENU_CATEGORY_COLLECTION)
    .getOne(id, { requestKey: null });
}

export async function createMenuCategory(values: MenuCategoryFormValues) {
  return pocketbase
    .collection<MenuCategoryRecord>(MENU_CATEGORY_COLLECTION)
    .create({ label: values.label.trim() }, { requestKey: null });
}

export async function updateMenuCategory(id: string, values: MenuCategoryFormValues) {
  return pocketbase
    .collection<MenuCategoryRecord>(MENU_CATEGORY_COLLECTION)
    .update(id, { label: values.label.trim() }, { requestKey: null });
}

export async function deleteMenuCategory(id: string) {
  return pocketbase
    .collection<MenuCategoryRecord>(MENU_CATEGORY_COLLECTION)
    .delete(id, { requestKey: null });
}
