import { useId, useState, type FormEvent } from 'react'
import type { Flashcard, NewFlashcard } from '@/types'

interface FlashcardFormProps {
  initial?: Flashcard | null
  onSubmit: (input: NewFlashcard) => void
  onCancel: () => void
}

export function FlashcardForm({ initial, onSubmit, onCancel }: FlashcardFormProps) {
  const formId = useId()
  const [front, setFront] = useState(initial?.front ?? '')
  const [back, setBack] = useState(initial?.back ?? '')
  const [topic, setTopic] = useState(initial?.topic ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedFront = front.trim()
    const trimmedBack = back.trim()

    if (!trimmedFront || !trimmedBack) {
      setError('Both the front and back of the card are required.')
      return
    }

    onSubmit({ front: trimmedFront, back: trimmedBack, topic: topic.trim() || undefined })
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}

      <div className="field">
        <label htmlFor={`${formId}-front`}>Front</label>
        <textarea id={`${formId}-front`} className="textarea" value={front} onChange={(e) => setFront(e.target.value)} placeholder="Question or prompt" required />
      </div>

      <div className="field">
        <label htmlFor={`${formId}-back`}>Back</label>
        <textarea id={`${formId}-back`} className="textarea" value={back} onChange={(e) => setBack(e.target.value)} placeholder="Answer" required />
      </div>

      <div className="field">
        <label htmlFor={`${formId}-topic`}>Topic (optional)</label>
        <input id={`${formId}-topic`} type="text" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Spanish vocabulary" />
      </div>

      <div className="row gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save changes' : 'Add card'}
        </button>
      </div>
    </form>
  )
}
