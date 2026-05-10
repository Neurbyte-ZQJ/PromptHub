import { Tag } from '@/api'

interface SidebarProps {
  tags: Tag[]
  selectedTagId: number | null
  onTagSelect: (tagId: number | null) => void
}

export default function Sidebar({ tags, selectedTagId, onTagSelect }: SidebarProps) {
  return (
    <aside className="w-64 border-r p-4 bg-card">
      <h2 className="text-lg font-semibold mb-4">标签筛选</h2>
      <div className="space-y-2">
        <button
          onClick={() => onTagSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            selectedTagId === null
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          }`}
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagSelect(tag.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedTagId === tag.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </aside>
  )
}
