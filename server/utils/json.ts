export function parseAuditDetails(
  value: string | null | undefined
): Record<string, unknown> | null {
  if (value == null) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
