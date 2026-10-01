import { CONTENT_PAGE_COLLECTION } from "@/constants/content-constants.ts";
import { MENU_ITEM_COLLECTION } from "@/constants/menu-constants.ts";
import { getFileUrl } from "@/helpers/file-helper.ts";
import { pocketbase } from "@/services/pocketbase.ts";
import type { ContentPageRecord } from "@/types/content-page.ts";
import type { MenuItemFormValues, MenuItemRecord } from "@/types/menu.ts";

function toMenuItemPayload(values: MenuItemFormValues) {
  const linksToPage = values.linkType === "page";

  return {
    label: values.label.trim(),
    category: values.category,
    href: linksToPage ? "" : values.href.trim(),
    page: linksToPage ? values.page : "",
    parent: values.isNested ? values.parent : "",
    ...(values.icon ? { icon: values.icon } : {}),
  };
}

export async function listPageMenuItems(pageId?: string) {
  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
    .getFullList({
      filter: pageId
        ? pocketbase.filter("page = {:page}", { page: pageId })
        : 'page != ""',
      requestKey: null,
      sort: "label",
    });
}

export async function unlinkMenuItems(pageId: string, exceptId?: string) {
  const linkedItems = await listPageMenuItems(pageId);

  await Promise.all(
    linkedItems
      .filter((item) => item.id !== exceptId)
      .map((item) =>
        pocketbase
          .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
          .update(item.id, { page: "" }, { requestKey: null }),
      ),
  );
}

export async function listMenuItems(): Promise<MenuItemRecord[]> {
  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
    .getFullList({
      expand: "category,page,parent",
      requestKey: null,
      sort: "label",
    });
}

export async function listMenuItemPages(): Promise<ContentPageRecord[]> {
  return pocketbase
    .collection<ContentPageRecord>(CONTENT_PAGE_COLLECTION)
    .getFullList({ requestKey: null, sort: "title" });
}

export async function getMenuItem(id: string) {
  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
    .getOne(id, { requestKey: null });
}

export async function createMenuItem(values: MenuItemFormValues) {
  const payload = toMenuItemPayload(values);

  // A page answers to a single menu item, so its previous owner has to be
  // released before the write or the menu_items hook refuses it.
  if (payload.page) {
    await unlinkMenuItems(payload.page);
  }

  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
    .create(payload, { requestKey: null });
}

export async function updateMenuItem(id: string, values: MenuItemFormValues) {
  const payload = toMenuItemPayload(values);

  if (payload.page) {
    await unlinkMenuItems(payload.page, id);
  }

  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
    .update(id, payload, { requestKey: null });
}

export async function deleteMenuItem(id: string) {
  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEM_COLLECTION)
    .delete(id, { requestKey: null });
}

export function getMenuItemIconUrl(record: MenuItemRecord) {
  return record.icon ? getFileUrl(record, record.icon, pocketbase) : "";
}
