import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, User, Heart, Folder } from 'lucide-react'
import { Prompt } from '@/api'

interface PromptCardProps {
  prompt: Prompt
  onDelete: (e: React.MouseEvent, id: number) => void
  onToggleFavorite: (e: React.MouseEvent, id: number) => void
}

export default function PromptCard({ prompt, onDelete, onToggleFavorite }: PromptCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group relative h-full flex flex-col">
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${prompt.is_favorited ? 'opacity-100 text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
          onClick={(e) => onToggleFavorite(e, prompt.id)}
        >
          <Heart className={`h-4 w-4 ${prompt.is_favorited ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => onDelete(e, prompt.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 pr-16">
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
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4.5em]">
          {prompt.content}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {prompt.categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-0.5 text-xs font-medium"
              >
                <Folder className="h-3 w-3" />
                {cat.name}
              </span>
            ))}
            {prompt.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
          {prompt.favorite_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
              <Heart className="h-3 w-3 fill-current text-red-400" />
              {prompt.favorite_count}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
