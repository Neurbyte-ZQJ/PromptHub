import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, LogOut, User, Download, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onCreateClick: () => void
  onExport: () => void
  onImportClick: () => void
}

export default function Header({
  searchQuery,
  onSearchChange,
  onCreateClick,
  onExport,
  onImportClick,
}: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="p-6 border-b flex items-center gap-4 justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索提示词..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          新建提示词
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          导出
        </Button>
        <Button variant="outline" onClick={onImportClick}>
          <Upload className="h-4 w-4 mr-2" />
          导入
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.username}</span>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </Button>
      </div>
    </header>
  )
}
