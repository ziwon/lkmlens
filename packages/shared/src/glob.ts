/** Minimal glob matcher supporting `*` (single segment) and `**` (any depth). */
export function globMatch(pattern: string, path: string): boolean {
  const escaped = pattern
    .split("**")
    .map((segment) =>
      segment
        .split("*")
        .map((literal) => literal.replace(/[.+^${}()|[\]\\]/g, "\\$&"))
        .join("[^/]*"),
    )
    .join(".*");
  const re = new RegExp(`^${escaped}$`);
  return re.test(path);
}
