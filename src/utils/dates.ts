/**
 * All date utilities use LOCAL dates to avoid UTC shift bugs.
 * Date strings are always YYYY-MM-DD in the user's local timezone.
 */

/** Return today as YYYY-MM-DD in local time */
export function todayString(): string {
  return toDateString(new Date())
}

/** Convert a Date to YYYY-MM-DD in local time */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse a YYYY-MM-DD string into a local Date (midnight local time) */
export function fromDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Add `days` to a date string, return new YYYY-MM-DD */
export function addDays(dateStr: string, days: number): string {
  const d = fromDateString(dateStr)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

/** Return the number of days between two date strings (endDate - startDate) */
export function daysBetween(startStr: string, endStr: string): number {
  const start = fromDateString(startStr)
  const end = fromDateString(endStr)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/** Return true if dateStr is today */
export function isToday(dateStr: string): boolean {
  return dateStr === todayString()
}

/** Return true if dateStr is before today */
export function isPast(dateStr: string): boolean {
  return dateStr < todayString()
}

/** Return true if dateStr is today or in the past */
export function isTodayOrPast(dateStr: string): boolean {
  return dateStr <= todayString()
}

/**
 * Get all YYYY-MM-DD strings for a given week.
 * @param weekStartsOn 0 = Sunday, 1 = Monday
 */
export function getWeekDates(date: Date, weekStartsOn: 0 | 1 = 1): string[] {
  const day = date.getDay() // 0=Sun … 6=Sat
  const diff = (day - weekStartsOn + 7) % 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toDateString(d)
  })
}

/** Get start of week date string for a given date */
export function getWeekStart(dateStr: string, weekStartsOn: 0 | 1 = 1): string {
  const date = fromDateString(dateStr)
  const day = date.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  const start = new Date(date)
  start.setDate(date.getDate() - diff)
  return toDateString(start)
}

/** Get all dates in a calendar month as YYYY-MM-DD strings */
export function getMonthDates(year: number, month: number): string[] {
  // month is 1-based
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    const m = String(month).padStart(2, '0')
    return `${year}-${m}-${d}`
  })
}

/** Format date for display: "Monday, September 29" */
export function formatFullDate(dateStr: string): string {
  const d = fromDateString(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/** Format month/year: "September 2026" */
export function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** Short day name: "Mon", "Tue" etc. */
export function shortDayName(dateStr: string): string {
  return fromDateString(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

/** Short month+day: "Sep 29" */
export function shortDate(dateStr: string): string {
  return fromDateString(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Get day-of-month number */
export function dayOfMonth(dateStr: string): number {
  return fromDateString(dateStr).getDate()
}

/** Get week number string like "Week 40" */
export function weekLabel(dateStr: string): string {
  const d = fromDateString(dateStr)
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `Week ${weekNum}`
}

/** Get an array of YYYY-MM-DD from startDate to endDate inclusive */
export function dateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = []
  let current = startStr
  while (current <= endStr) {
    dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

/** Get greeting based on hour */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
