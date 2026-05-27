import { describe, it, expect } from 'vitest'
import { isTimeInRange, validateSchedule, ScheduleMode } from './schedule'

const h = (hh: number, mm = 0) => hh * 60 + mm

describe('isTimeInRange', () => {
  it('daytime range is start-inclusive, end-exclusive', () => {
    expect(isTimeInRange(h(9), h(9), h(18))).toBe(true) // at start
    expect(isTimeInRange(h(13), h(9), h(18))).toBe(true)
    expect(isTimeInRange(h(18), h(9), h(18))).toBe(false) // at end (exclusive)
    expect(isTimeInRange(h(8, 59), h(9), h(18))).toBe(false)
  })

  it('overnight range wraps past midnight', () => {
    expect(isTimeInRange(h(23), h(22), h(6))).toBe(true)
    expect(isTimeInRange(h(2), h(22), h(6))).toBe(true)
    expect(isTimeInRange(h(6), h(22), h(6))).toBe(false) // end exclusive
    expect(isTimeInRange(h(12), h(22), h(6))).toBe(false)
  })

  it('zero-length range is never active', () => {
    expect(isTimeInRange(h(9), h(9), h(9))).toBe(false)
  })
})

describe('validateSchedule', () => {
  it('allows overnight work hours (start > end)', () => {
    const res = validateSchedule({
      mode: ScheduleMode.WORK_HOURS,
      workHours: { start: '22:00', end: '06:00' },
    })
    expect(res.valid).toBe(true)
  })

  it('rejects zero-length work hours (start === end)', () => {
    const res = validateSchedule({
      mode: ScheduleMode.WORK_HOURS,
      workHours: { start: '09:00', end: '09:00' },
    })
    expect(res.valid).toBe(false)
  })
})
