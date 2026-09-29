import messages from "@/constants/messages.json";

export function getMenuCategoryLabelError(value: string) {
  if (!value.trim()) {
    return messages.menuCategories.label.empty;
  }

  return undefined;
}
