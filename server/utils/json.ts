/**
 * Safely parse a JSON string back to a Record.
 * Used to deserialize the `details` field of AuditLog, which is stored as a
 * JSON string for cross-database compatibility (SQLite/LibSQL + MySQL).
 */
export function parseAuditDetails(
  value: string | null | undefined
): Record<string, unknown> | null {
  if (value == null) return null
  if (typeof value === 'object') return value as Record<string, unknown>
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
