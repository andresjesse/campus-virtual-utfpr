import type { MenuTreeCategory } from "@/types/menu.ts";

export type VirtualMapMenuResult = {
  attempt: number;
  categories: MenuTreeCategory[];
  error: string | null;
};
