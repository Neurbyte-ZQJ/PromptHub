import { useState } from 'react'
import { Tag, Category } from '@/api'
import { Heart, FolderOpen, Folder, ChevronRight, ChevronDown, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface SidebarProps {
  tags: Tag[]
  categories: Category[]
  selectedTagId: number | null
  onTagSelect: (tagId: number | null) => void
  selectedCategoryId: number | null
  onCategorySelect: (categoryId: number | null) => void
  showFavoritesOnly: boolean
  onToggleFavorites: () => void
  onCreateCategory: (parentId?: number | null) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (category: Category) => void
}

function CategoryTreeItem({
  category,
  depth,
  selectedCategoryId,
  onCategorySelect,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: {
  category: Category
  depth: number
  selectedCategoryId: number | null
  onCategorySelect: (categoryId: number | null) => void
  onCreateCategory: (parentId?: number | null) => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (category: Category) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const hasChildren = category.children && category.children.length > 0
  const isSelected = selectedCategoryId === category.id

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onCategorySelect(category.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="shrink-0 p-0.5 hover:bg-accent/50 rounded"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        {isSelected ? (
          <FolderOpen className="h-4 w-4 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="flex-1 truncate">{category.name}</span>
        <div className={`shrink-0 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="p-0.5 hover:bg-accent/50 rounded"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-32 bg-popover border rounded-md shadow-md py-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onCreateCategory(category.id) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" /> 新建子分类
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEditCategory(category) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent flex items-center gap-2"
                >
                  <Pencil className="h-3 w-3" /> 重命名
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDeleteCategory(category) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" /> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {hasChildren && expanded && category.children.map((child) => (
        <CategoryTreeItem
          key={child.id}
          category={child}
          depth={depth + 1}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={onCategorySelect}
          onCreateCategory={onCreateCategory}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      ))}
    </div>
  )
}

export default function Sidebar({
  tags,
  categories,
  selectedTagId,
  onTagSelect,
  selectedCategoryId,
  onCategorySelect,
  showFavoritesOnly,
  onToggleFavorites,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories')
  const [allExpanded, setAllExpanded] = useState(true)

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 pb-2">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            分类目录
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tags'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            标签筛选
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4">
        {activeTab === 'categories' ? (
          <div className="space-y-1">
            {/* 全部提示词 - 可展开的父节点 */}
            <div>
              <button
                onClick={() => { onCategorySelect(null); onTagSelect(null); if (showFavoritesOnly) onToggleFavorites() }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                  selectedCategoryId === null && selectedTagId === null && !showFavoritesOnly
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-accent font-medium'
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setAllExpanded(!allExpanded) }}
                  className="shrink-0 p-0.5 hover:bg-accent/50 rounded"
                >
                  {allExpanded ? (
                    <ChevronDown className={`h-3.5 w-3.5 ${selectedCategoryId === null && !showFavoritesOnly ? 'text-primary-foreground' : ''}`} />
                  ) : (
                    <ChevronRight className={`h-3.5 w-3.5 ${selectedCategoryId === null && !showFavoritesOnly ? 'text-primary-foreground' : ''}`} />
                  )}
                </button>
                <FolderOpen className={`h-4 w-4 shrink-0 ${selectedCategoryId === null && !showFavoritesOnly ? '' : 'text-blue-500'}`} />
                全部提示词
              </button>

              {/* 分类文件夹 - 作为"全部提示词"的子项缩进 */}
              {allExpanded && (
                <div>
                  {categories.map((category) => (
                    <CategoryTreeItem
                      key={category.id}
                      category={category}
                      depth={1}
                      selectedCategoryId={selectedCategoryId}
                      onCategorySelect={onCategorySelect}
                      onCreateCategory={onCreateCategory}
                      onEditCategory={onEditCategory}
                      onDeleteCategory={onDeleteCategory}
                    />
                  ))}
                  <button
                    onClick={() => onCreateCategory(null)}
                    className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 pl-[40px] pr-2 py-1.5 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                    新建分类
                  </button>
                </div>
              )}
            </div>

            {/* 我的收藏 - 独立顶级项 */}
            <button
              onClick={onToggleFavorites}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 font-medium ${
                showFavoritesOnly
                  ? 'bg-red-500 text-white'
                  : 'hover:bg-accent'
              }`}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              我的收藏
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => { onTagSelect(null); onCategorySelect(null) }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedTagId === null && selectedCategoryId === null && !showFavoritesOnly
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => { onTagSelect(tag.id); onCategorySelect(null) }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedTagId === tag.id && !showFavoritesOnly
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
