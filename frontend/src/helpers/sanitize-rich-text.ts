import DOMPurify from "dompurify";

export default function sanitizeRichText(content: string): string {
  return DOMPurify.sanitize(content);
}
