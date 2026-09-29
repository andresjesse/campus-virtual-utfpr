import { appLocale } from "@/config/locale.ts";
import messages from "@/constants/messages.json";

// Decimal megabytes (1 MB = 1000 * 1000 bytes), the same unit the upload size limits use.
const BYTES_PER_MEGABYTE = 1000 * 1000;

export function bytesToMegabytes(bytes: number): number {
  return bytes / BYTES_PER_MEGABYTE;
}

export function formatFileSize(bytes: number): string {
  return `${bytesToMegabytes(bytes).toFixed(1)}MB`;
}

export function formatDate(date: string): string {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? messages.common.emptyValue
    : new Intl.DateTimeFormat(appLocale).format(parsedDate);
}
