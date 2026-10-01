import { appLocale } from "@/config/locale.ts";
import messages from "@/constants/messages.json";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { ContentPageRecord } from "@/types/content-page.ts";
import type {
  MenuCategoryRecord,
  MenuItemFormErrors,
  MenuItemFormValues,
  MenuItemOption,
  MenuItemPageOption,
  MenuItemRecord,
} from "@/types/menu.ts";

export function isValidMenuItemHref(value: string) {
  try {
    const url = new URL(value.trim());

    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getMenuItemHrefError(value: string) {
  const href = value.trim();

  if (!href) {
    return messages.menuItems.link.empty;
  }

  if (!isValidMenuItemHref(href)) {
    return messages.menuItems.link.invalid;
  }

  return undefined;
}

export function validateMenuItemForm(
  values: MenuItemFormValues,
  hasCurrentIcon: boolean,
): MenuItemFormErrors {
  const errors: MenuItemFormErrors = {};

  if (!values.label.trim()) {
    errors.label = messages.menuItems.label.empty;
  }

  if (values.linkType === "link") {
    const hrefError = getMenuItemHrefError(values.href);
    if (hrefError) {
      errors.href = hrefError;
    }
  } else if (!values.page) {
    errors.page = messages.menuItems.editor.pageRequiredError;
  }

  if (!values.category) {
    errors.category = messages.menuItems.editor.categoryRequiredError;
  }

  if (values.isNested && !values.parent) {
    errors.parent = messages.menuItems.editor.parentRequiredError;
  }

  if (!hasCurrentIcon && !values.icon) {
    errors.icon = messages.menuItems.editor.iconRequiredError;
  }

  return errors;
}

export function toMenuItemFormValues(record: MenuItemRecord): MenuItemFormValues {
  return {
    label: record.label,
    linkType: record.page ? "page" : "link",
    href: record.href,
    page: record.page,
    isNested: Boolean(record.parent),
    parent: record.parent,
    category: record.category,
    icon: null,
  };
}

function getMenuItemName(item: MenuItemRecord) {
  return item.label || messages.menuItems.list.noIdentifier;
}

export function getMenuItemCategoryName(item: MenuItemRecord) {
  return item.expand?.category?.label ?? "";
}

export function sortMenuItemsByCategory(menuItems: MenuItemRecord[]): MenuItemRecord[] {
  return [...menuItems].sort((first, second) => {
    const byCategory = getMenuItemCategoryName(first).localeCompare(
      getMenuItemCategoryName(second),
      appLocale,
    );

    return byCategory !== 0
      ? byCategory
      : getMenuItemName(first).localeCompare(getMenuItemName(second), appLocale);
  });
}

export function findMenuItemPageOwner(
  menuItems: MenuItemRecord[],
  pageId: string,
  currentItemId?: string,
) {
  return menuItems.find(
    (item) => item.page === pageId && item.id !== currentItemId,
  );
}

export function buildMenuItemPageOptions(
  pages: ContentPageRecord[],
  menuItems: MenuItemRecord[],
  currentItemId?: string,
): MenuItemPageOption[] {
  return pages.map((page) => {
    const option = {
      value: page.id,
      label: page.title || messages.menuItems.editor.pageUntitled,
    };

    if (page.entity) {
      return {
        ...option,
        disabled: true,
        note: messages.menuItems.editor.pageHeldByEntity,
      };
    }

    const owner = findMenuItemPageOwner(menuItems, page.id, currentItemId);

    if (!owner) {
      return { ...option, note: messages.menuItems.editor.pageAvailable };
    }

    const ownerLabel = getMenuItemName(owner);

    return {
      ...option,
      ownerLabel,
      note: formatMessage(messages.menuItems.editor.pageHeldByItem, ownerLabel),
    };
  });
}

export function getMenuItemParentOptions(
  menuItems: MenuItemRecord[],
  categoryId: string,
  currentItemId?: string,
): MenuItemOption[] {

  if (!categoryId) return [];

  const itemsById = new Map(menuItems.map((item) => [item.id, item]));

  function isNestedUnderCurrent(item: MenuItemRecord) {
    const visited = new Set([item.id]);
    let ancestorId = item.parent;

    while (ancestorId && !visited.has(ancestorId)) {
      if (ancestorId === currentItemId) return true;

      visited.add(ancestorId);
      ancestorId = itemsById.get(ancestorId)?.parent ?? "";
    }

    return false;
  }

  return menuItems
    .filter(
      (item) =>
        item.category === categoryId &&
        item.id !== currentItemId &&
        !isNestedUnderCurrent(item),
    )
    .map((item) => ({ value: item.id, label: getMenuItemName(item) }));
}

export function toMenuCategoryOptions(
  categories: MenuCategoryRecord[],
): MenuItemOption[] {
  return categories.map((category) => ({
    value: category.id,
    label: category.label || messages.menuCategories.list.noIdentifier,
  }));
}
