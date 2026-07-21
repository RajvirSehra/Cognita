/** Groups items with a `date` (YYYY-MM-DD) field by date, newest date first. */
export function groupByDate<T extends { date: string; createdAt: string }>(items: T[]): Array<[string, T[]]> {
  const byDate = new Map<string, T[]>()
  for (const item of items) {
    const bucket = byDate.get(item.date)
    if (bucket) bucket.push(item)
    else byDate.set(item.date, [item])
  }

  for (const bucket of byDate.values()) {
    bucket.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  return Array.from(byDate.entries()).sort(([a], [b]) => b.localeCompare(a))
}
