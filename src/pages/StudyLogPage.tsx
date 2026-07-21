import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { StatCard } from '@/components/common/StatCard'
import { SessionFilters } from '@/components/studylog/SessionFilters'
import { SessionForm } from '@/components/studylog/SessionForm'
import { SessionItem } from '@/components/studylog/SessionItem'
import { useStudySessions } from '@/hooks/useStudySessions'
import {
  averageSessionMinutes,
  monthlyMinutes,
  totalMinutes,
  weeklyMinutes,
  yearlyMinutes,
} from '@/statistics/aggregates'
import type { NewStudySession, StudySession } from '@/types'
import { formatDisplayDate, formatDuration, todayISODate } from '@/utils/date'
import { groupByDate } from '@/utils/grouping'
import styles from './StudyLogPage.module.css'

export function StudyLogPage() {
  const { sessions, addSession, updateSession, deleteSession } = useStudySessions()
  const [searchQuery, setSearchQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<StudySession | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const today = todayISODate()

  const topics = useMemo(() => Array.from(new Set(sessions.map((s) => s.topic))).sort(), [sessions])

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return sessions.filter((s) => {
      if (topicFilter !== 'all' && s.topic !== topicFilter) return false
      if (!q) return true
      return s.topic.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q) || s.takeaway?.toLowerCase().includes(q)
    })
  }, [sessions, topicFilter, searchQuery])

  const grouped = useMemo(() => groupByDate(filteredSessions), [filteredSessions])

  const aggregates = useMemo(
    () => ({
      totalHours: totalMinutes(sessions) / 60,
      totalSessions: sessions.length,
      weekly: weeklyMinutes(sessions, today),
      monthly: monthlyMinutes(sessions, today),
      yearly: yearlyMinutes(sessions, today),
      average: averageSessionMinutes(sessions),
    }),
    [sessions, today],
  )

  function openNewSessionForm() {
    setEditingSession(null)
    setFormOpen(true)
  }

  function openEditForm(session: StudySession) {
    setEditingSession(session)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingSession(null)
  }

  function handleSubmit(input: NewStudySession) {
    if (editingSession) {
      updateSession(editingSession.id, input)
    } else {
      addSession(input)
    }
    closeForm()
  }

  return (
    <div className="stack gap-5">
      <section className={styles.grid}>
        <StatCard label="Total hours" value={aggregates.totalHours.toFixed(1)} />
        <StatCard label="Sessions" value={aggregates.totalSessions} />
        <StatCard label="This week" value={formatDuration(aggregates.weekly)} />
        <StatCard label="This month" value={formatDuration(aggregates.monthly)} />
        <StatCard label="This year" value={formatDuration(aggregates.yearly)} />
        <StatCard label="Avg session" value={formatDuration(aggregates.average)} />
      </section>

      <button type="button" className="btn btn-primary btn-block" onClick={openNewSessionForm}>
        Log a session
      </button>

      <SessionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topics={topics}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
      />

      {grouped.length === 0 ? (
        <EmptyState
          title={sessions.length === 0 ? 'No sessions yet' : 'No sessions match'}
          message={sessions.length === 0 ? 'Log your first study session to start your permanent record.' : 'Try a different search or topic filter.'}
        />
      ) : (
        <div className="stack gap-5">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <h3 className={styles.dateHeading}>{formatDisplayDate(date, today)}</h3>
              <ul className="stack gap-3">
                {items.map((session) => (
                  <SessionItem key={session.id} session={session} onEdit={() => openEditForm(session)} onDelete={() => setDeletingId(session.id)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <Modal title={editingSession ? 'Edit session' : 'Log a session'} onClose={closeForm}>
          <SessionForm initial={editingSession} onSubmit={handleSubmit} onCancel={closeForm} />
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete session"
          message="This permanently deletes this study session from your log. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            deleteSession(deletingId)
            setDeletingId(null)
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
