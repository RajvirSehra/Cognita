import { describe, expect, it } from 'vitest'
import { computeNextSM2State, createInitialSM2State, DEFAULT_EASE_FACTOR, MIN_EASE_FACTOR } from '@/scheduling/sm2'

describe('createInitialSM2State', () => {
  it('starts new cards at the default ease factor with no repetitions', () => {
    const state = createInitialSM2State()
    expect(state).toEqual({ easeFactor: DEFAULT_EASE_FACTOR, intervalDays: 0, repetitions: 0 })
  })
})

describe('computeNextSM2State — Again', () => {
  it('resets repetitions to 0 and schedules a short interval', () => {
    const state = { easeFactor: 2.5, intervalDays: 20, repetitions: 4 }
    const next = computeNextSM2State(state, 'again')
    expect(next.repetitions).toBe(0)
    expect(next.intervalDays).toBe(1)
  })

  it('drops the ease factor but never below the floor', () => {
    const next = computeNextSM2State({ easeFactor: 1.35, intervalDays: 1, repetitions: 1 }, 'again')
    expect(next.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR)
  })
})

describe('computeNextSM2State — Hard / Good / Easy progression', () => {
  it('produces a strictly increasing next interval for Hard < Good < Easy at first repetition', () => {
    const state = createInitialSM2State()
    const hard = computeNextSM2State(state, 'hard')
    const good = computeNextSM2State(state, 'good')
    const easy = computeNextSM2State(state, 'easy')
    expect(hard.intervalDays).toBeLessThanOrEqual(good.intervalDays)
    expect(good.intervalDays).toBeLessThan(easy.intervalDays)
  })

  it('produces a strictly increasing next interval for Hard < Good < Easy at later repetitions', () => {
    const state = { easeFactor: 2.5, intervalDays: 10, repetitions: 3 }
    const hard = computeNextSM2State(state, 'hard')
    const good = computeNextSM2State(state, 'good')
    const easy = computeNextSM2State(state, 'easy')
    expect(hard.intervalDays).toBeLessThan(good.intervalDays)
    expect(good.intervalDays).toBeLessThan(easy.intervalDays)
  })

  it('increments repetitions on every non-Again grade', () => {
    const state = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 }
    expect(computeNextSM2State(state, 'hard').repetitions).toBe(3)
    expect(computeNextSM2State(state, 'good').repetitions).toBe(3)
    expect(computeNextSM2State(state, 'easy').repetitions).toBe(3)
  })

  it('grows the ease factor on Easy and shrinks it on Hard, leaves Good roughly stable', () => {
    const state = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 }
    const hard = computeNextSM2State(state, 'hard')
    const good = computeNextSM2State(state, 'good')
    const easy = computeNextSM2State(state, 'easy')
    expect(easy.easeFactor).toBeGreaterThan(good.easeFactor)
    expect(good.easeFactor).toBeGreaterThan(hard.easeFactor)
  })

  it('never lets the interval shrink to zero or below', () => {
    const state = { easeFactor: MIN_EASE_FACTOR, intervalDays: 1, repetitions: 5 }
    const hard = computeNextSM2State(state, 'hard')
    expect(hard.intervalDays).toBeGreaterThanOrEqual(1)
  })
})
