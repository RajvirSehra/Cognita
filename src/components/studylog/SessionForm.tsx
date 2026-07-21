import { useId, useState, type FormEvent } from 'react'
import type { NewStudySession, StudySession } from '@/types'
import { todayISODate } from '@/utils/date'

interface SessionFormProps {
  initial?: StudySession | null
  onSubmit: (input: NewStudySession) => void
  onCancel: () => void
}

export function SessionForm({ initial, onSubmit, onCancel }: SessionFormProps) {
  const formId = useId()
  const [date, setDate] = useState(initial?.date ?? todayISODate())
  const [topic, setTopic] = useState(initial?.topic ?? '')
  const [durationMinutes, setDurationMinutes] = useState(initial ? String(initial.durationMinutes) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [takeaway, setTakeaway] = useState(initial?.takeaway ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTopic = topic.trim()
    const minutes = Number(durationMinutes)

    if (!trimmedTopic) {
      setError('Give this session a topic.')
      return
    }
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setError('Duration must be a positive number of minutes.')
      return
    }

    onSubmit({
      date,
      topic: trimmedTopic,
      durationMinutes: minutes,
      notes: notes.trim() || undefined,
      takeaway: takeaway.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} id={`${formId}-session-form`}>
      {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}

      <div className="field">
        <label htmlFor={`${formId}-date`}>Date</label>
        <input id={`${formId}-date`} type="date" className="input" value={date} max={todayISODate()} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="field">
        <label htmlFor={`${formId}-topic`}>Topic</label>
        <input
          id={`${formId}-topic`}
          type="text"
          className="input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Linear algebra"
          required
        />
      </div>

      <div className="field">
        <label htmlFor={`${formId}-duration`}>Duration (minutes)</label>
        <input
          id={`${formId}-duration`}
          type="number"
          className="input"
          min={1}
          step={1}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="45"
          required
        />
      </div>

      <div className="field">
        <label htmlFor={`${formId}-notes`}>Notes (optional)</label>
        <textarea id={`${formId}-notes`} className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you cover?" />
      </div>

      <div className="field">
        <label htmlFor={`${formId}-takeaway`}>Key takeaway (optional)</label>
        <textarea
          id={`${formId}-takeaway`}
          className="textarea"
          value={takeaway}
          onChange={(e) => setTakeaway(e.target.value)}
          placeholder="The one thing worth remembering"
        />
      </div>

      <div className="row gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save changes' : 'Log session'}
        </button>
      </div>
    </form>
  )
}
