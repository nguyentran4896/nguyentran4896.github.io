export function formatDate(d: string) {
  if (!d) return ""
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}
