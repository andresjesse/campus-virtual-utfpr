import type { RouteTabOption } from "@/components/tabs/RouteTabs.tsx";
import messages from "@/constants/messages.json";

export const MENU_TAB_OPTIONS: RouteTabOption[] = [
  {
    value: "items",
    label: messages.menu.tabs.items,
    to: "/admin/menu/items",
  },
  {
    value: "categories",
    label: messages.menu.tabs.categories,
    to: "/admin/menu/categories",
  },
];
