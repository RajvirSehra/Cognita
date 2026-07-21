import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysBetween,
  formatDisplayDate,
  formatDuration,
  isOnOrBefore,
  parseISODate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toISODate,
} from '@/utils/date'

describe('toISODate / parseISODate', () => {
  it('round-trips without shifting the calendar day', () => {
    const iso = '2026-01-31'
    expect(toISODate(parseISODate(iso))).toBe(iso)
  })
})

describe('addDays', () => {
  it('adds and subtracts days, crossing month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('daysBetween / isOnOrBefore', () => {
  it('computes signed day differences', () => {
    expect(daysBetween('2026-01-05', '2026-01-01')).toBe(4)
    expect(daysBetween('2026-01-01', '2026-01-05')).toBe(-4)
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0)
  })

  it('reports on-or-before correctly', () => {
    expect(isOnOrBefore('2026-01-01', '2026-01-05')).toBe(true)
    expect(isOnOrBefore('2026-01-05', '2026-01-05')).toBe(true)
    expect(isOnOrBefore('2026-01-06', '2026-01-05')).toBe(false)
  })
})

describe('startOfWeek / startOfMonth / startOfYear', () => {
  it('finds the Monday of the current week', () => {
    expect(startOfWeek('2026-06-18')).toBe('2026-06-15') // Thursday -> that week's Monday
    expect(startOfWeek('2026-06-15')).toBe('2026-06-15') // Monday -> itself
  })

  it('finds the first of the month and year', () => {
    expect(startOfMonth('2026-06-18')).toBe('2026-06-01')
    expect(startOfYear('2026-06-18')).toBe('2026-01-01')
  })
})

describe('formatDisplayDate', () => {
  it('labels today, yesterday, and tomorrow specially', () => {
    expect(formatDisplayDate('2026-06-15', '2026-06-15')).toBe('Today')
    expect(formatDisplayDate('2026-06-14', '2026-06-15')).toBe('Yesterday')
    expect(formatDisplayDate('2026-06-16', '2026-06-15')).toBe('Tomorrow')
  })

  it('formats other dates as weekday, day, and month', () => {
    expect(formatDisplayDate('2026-06-01', '2026-06-15')).toBe('Mon, 1 Jun')
  })
})

describe('formatDuration', () => {
  it('formats minutes-only durations', () => {
    expect(formatDuration(45)).toBe('45m')
  })

  it('formats whole-hour durations', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats hours and minutes together', () => {
    expect(formatDuration(95)).toBe('1h 35m')
  })
})
