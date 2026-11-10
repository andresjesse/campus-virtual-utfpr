export const MENU_ITEM_COLLECTION = "menu_items";

export const MENU_CATEGORY_COLLECTION = "menu_categories";

export const MENU_COLLECTIONS = [MENU_ITEM_COLLECTION, MENU_CATEGORY_COLLECTION] as const;

export const MENU_ITEM_ICON_ACCEPT = {
  "image/svg+xml": [".svg"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export const MENU_ITEM_ICON_MAX_SIZE_IN_BYTES = 1000 * 1000 * 5;
