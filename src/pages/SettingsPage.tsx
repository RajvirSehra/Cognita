import { useRef, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/context/ToastContext'
import { BackupParseError, exportAppData, importAppData, parseBackupFile } from '@/storage/backupRepo'
import type { AppData } from '@/types'
import { todayISODate } from '@/utils/date'

function downloadJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cognita-backup-${todayISODate()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function SettingsPage() {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<AppData | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleExport() {
    try {
      downloadJSON(exportAppData())
      showToast('Backup exported.', 'success')
    } catch {
      showToast('Could not export backup.', 'error')
    }
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : ''
        const data = parseBackupFile(text)
        setPendingImport(data)
      } catch (error) {
        setImportError(error instanceof BackupParseError ? error.message : 'Could not read this file.')
      }
    }
    reader.onerror = () => setImportError('Could not read this file. It may be corrupted.')
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!pendingImport) return
    try {
      importAppData(pendingImport)
      setPendingImport(null)
      showToast('Backup imported. Reloading...', 'success')
      window.setTimeout(() => window.location.reload(), 600)
    } catch {
      showToast('Could not import backup.', 'error')
    }
  }

  return (
    <div className="stack gap-5">
      <section className="card">
        <h2>Backup</h2>
        <p className="text-muted">Everything in Cognita lives only in this browser. Export a backup regularly, and keep a copy somewhere safe.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={handleExport}>
          Export backup (JSON)
        </button>
      </section>

      <section className="card">
        <h2>Restore</h2>
        <p className="text-muted">Importing a backup replaces all study sessions, flashcards, and review history currently stored here.</p>
        {importError && (
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            {importError}
          </p>
        )}
        <input ref={fileInputRef} type="file" accept="application/json" className="visually-hidden" onChange={handleFileSelected} />
        <button type="button" className="btn btn-block" onClick={() => fileInputRef.current?.click()}>
          Import backup (JSON)
        </button>
      </section>

      <section className="card">
        <h2>About</h2>
        <p className="text-muted">
          Cognita is a personal learning operating system: a study log, spaced-repetition flashcards, and progress tracking, all stored
          offline on this device. Future modules — a PDF and document library, AI-assisted review, a knowledge graph, and cross-device
          sync — are on the roadmap; see the project README for details.
        </p>
      </section>

      {pendingImport && (
        <ConfirmDialog
          title="Replace all data?"
          message={`This backup contains ${pendingImport.studySessions.length} session(s) and ${pendingImport.flashcards.length} flashcard(s), exported ${new Date(pendingImport.exportedAt).toLocaleString()}. Importing it will permanently replace everything currently stored in Cognita.`}
          confirmLabel="Replace data"
          danger
          onConfirm={confirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </div>
  )
}
