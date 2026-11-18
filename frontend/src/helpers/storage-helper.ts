export function readStorageItem(
  key: string,
  storage: Storage = window.localStorage,
): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(
  key: string,
  value: string,
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(key, value);
  } catch {
    return;
  }
}
