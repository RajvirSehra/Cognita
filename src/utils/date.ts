/**
 * All dates in this app are represented as YYYY-MM-DD "calendar dates" in the
 * user's local timezone — never as UTC timestamps. This avoids the classic
 * off-by-one-day bug where `new Date("2024-01-01")` parses as UTC midnight
 * and renders as Dec 31 in negative-offset timezones.
 */

const pad2 = (n: number) => String(n).padStart(2, '0')

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Parses a YYYY-MM-DD string into a local-midnight Date. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function todayISODate(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** a - b, in whole days. Positive if a is after b. */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const dateA = parseISODate(a)
  const dateB = parseISODate(b)
  return Math.round((dateA.getTime() - dateB.getTime()) / msPerDay)
}

/** True if `a` is on the same day as, or before, `b`. */
export function isOnOrBefore(a: string, b: string): boolean {
  return daysBetween(a, b) <= 0
}

export function startOfWeek(iso: string): string {
  const date = parseISODate(iso)
  const day = date.getDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day // Monday-start week
  date.setDate(date.getDate() + diff)
  return toISODate(date)
}

export function startOfMonth(iso: string): string {
  const date = parseISODate(iso)
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function startOfYear(iso: string): string {
  const date = parseISODate(iso)
  return toISODate(new Date(date.getFullYear(), 0, 1))
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatDisplayDate(iso: string, today: string = todayISODate()): string {
  const diff = daysBetween(today, iso)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff === -1) return 'Tomorrow'
  const date = parseISODate(iso)
  return `${WEEKDAY_LABELS[date.getDay()]}, ${date.getDate()} ${MONTH_LABELS[date.getMonth()]}${
    date.getFullYear() !== parseISODate(today).getFullYear() ? ` ${date.getFullYear()}` : ''
  }`
}

export function formatShortDate(iso: string): string {
  const date = parseISODate(iso)
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
