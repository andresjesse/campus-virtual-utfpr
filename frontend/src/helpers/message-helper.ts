// Placeholders in messages.json are written as {name} (see CLAUDE.md, UI strings).
const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/**
 * Fills the `{placeholder}` slots of a `messages.json` string with runtime values.
 *
 * Every user-facing string lives in `src/constants/messages.json`, so text that
 * needs a value mixed in (a record name, a count) keeps a named placeholder in
 * the catalog and has it substituted here, instead of being concatenated at the
 * call site. That keeps the whole sentence — and its word order — inside the
 * catalog, so swapping the file for another language still works.
 *
 * @param template a string read from `messages.json`, e.g. `"Editar mesh {name}"`.
 * @param values a bare string for a message with a single placeholder, or an
 * object keyed by placeholder name when it has several. A bare string fills
 * *every* placeholder, so don't pass one to a multi-placeholder message; an
 * object leaves any placeholder it has no key for untouched, as `{key}`.
 * @returns the message with its placeholders replaced.
 *
 * @example
 * formatMessage(messages.mesh.list.editAriaLabel, "predio_a");
 * // → "Editar mesh predio_a"
 *
 * formatMessage(messages.mesh.list.deleteConfirmFirst, { name: "predio_a" });
 * // → "Deseja realmente excluir permanentemente o mesh predio_a?"
 */
export function formatMessage(
  template: string,
  values: string | Record<string, string>,
): string {
  return template.replace(PLACEHOLDER_PATTERN, (placeholder, key: string) => {
    if (typeof values === "string") return values;

    return key in values ? values[key] : placeholder;
  });
}
