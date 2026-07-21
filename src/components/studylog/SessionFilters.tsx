interface SessionFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  topics: string[]
  topicFilter: string
  onTopicFilterChange: (value: string) => void
}

export function SessionFilters({ searchQuery, onSearchChange, topics, topicFilter, onTopicFilterChange }: SessionFiltersProps) {
  return (
    <div className="row gap-3">
      <input
        type="search"
        className="input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search sessions..."
        aria-label="Search study sessions"
      />
      <select
        className="select"
        value={topicFilter}
        onChange={(e) => onTopicFilterChange(e.target.value)}
        aria-label="Filter by topic"
        style={{ maxWidth: '40%' }}
      >
        <option value="all">All topics</option>
        {topics.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>
    </div>
  )
}
