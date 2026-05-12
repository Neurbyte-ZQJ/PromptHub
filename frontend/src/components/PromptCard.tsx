import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, User } from 'lucide-react'
import { Prompt } from '@/api'

interface PromptCardProps {
  prompt: Prompt
  onDelete: (e: React.MouseEvent, id: number) => void
}

export default function PromptCard({ prompt, onDelete }: PromptCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={(e) => onDelete(e, prompt.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 pr-8">
          <CardTitle className="text-lg">{prompt.title}</CardTitle>
          {prompt.owner_username && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <User className="h-3 w-3" />
              {prompt.owner_username}
            </span>
          )}
          {prompt.is_public && (
            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
              公开
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {prompt.content}
        </p>
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
