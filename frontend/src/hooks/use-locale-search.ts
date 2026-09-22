import { useMemo } from "react";

import { appLocale } from "@/config/locale.ts";

export function useLocaleSearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
): T[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(appLocale);

    return normalizedQuery
      ? items.filter((item) =>
          getSearchableText(item).toLocaleLowerCase(appLocale).includes(normalizedQuery),
        )
      : items;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getSearchableText is a plain field accessor
  }, [items, query]);
}
