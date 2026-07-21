import type { FlashcardGrade } from '@/types'

/**
 * Simplified SM-2 spaced-repetition algorithm.
 *
 * The ease-factor update uses the original SM-2 formula, with the four
 * grading buttons mapped onto SM-2's 0-5 quality scale the way most modern
 * flashcard apps do it:
 *
 *   Again -> 0   Hard -> 3   Good -> 4   Easy -> 5
 *
 * Interval growth then branches per grade so that Again / Hard / Good / Easy
 * always produce a strictly increasing next interval at any repetition
 * count — Again resets the card into relearning, Hard grows the interval
 * cautiously, Good follows the standard SM-2 progression, and Easy grows it
 * generously.
 */

export const DEFAULT_EASE_FACTOR = 2.5
export const MIN_EASE_FACTOR = 1.3

const GRADE_QUALITY: Record<FlashcardGrade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
}

export interface SM2State {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export function createInitialSM2State(): SM2State {
  return { easeFactor: DEFAULT_EASE_FACTOR, intervalDays: 0, repetitions: 0 }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function nextEaseFactor(easeFactor: number, grade: FlashcardGrade): number {
  const quality = GRADE_QUALITY[grade]
  const raw = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  return Math.max(MIN_EASE_FACTOR, round2(raw))
}

export function computeNextSM2State(state: SM2State, grade: FlashcardGrade): SM2State {
  const easeFactor = nextEaseFactor(state.easeFactor, grade)

  if (grade === 'again') {
    return { easeFactor, intervalDays: 1, repetitions: 0 }
  }

  const repetitions = state.repetitions + 1
  let intervalDays: number

  if (repetitions === 1) {
    intervalDays = grade === 'hard' ? 1 : grade === 'good' ? 1 : 4
  } else if (repetitions === 2) {
    intervalDays = grade === 'hard' ? 3 : grade === 'good' ? 6 : 8
  } else {
    const multiplier = grade === 'hard' ? easeFactor * 0.8 : grade === 'good' ? easeFactor : easeFactor * 1.3
    intervalDays = Math.round(state.intervalDays * multiplier)
  }

  return { easeFactor, intervalDays: Math.max(1, intervalDays), repetitions }
}
