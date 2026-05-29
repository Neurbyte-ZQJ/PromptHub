import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/components/ui/toast'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const { downloadImportTemplate, importPrompts } = useApi()
  const { addToast } = useToast()

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadImportTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'prompts_import_template.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download template:', error)
      addToast({ message: '下载模板失败', type: 'error' })
    }
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    try {
      const result = await importPrompts(file)
      onOpenChange(false)
      setFile(null)
      onSuccess()
      addToast({
        message: `导入完成：成功 ${result.imported} 条，跳过 ${result.skipped} 条`,
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to import prompts:', error)
      addToast({ message: (error as Error).message || '导入失败', type: 'error' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量导入提示词</DialogTitle>
          <DialogDescription>
            请选择之前导出的 Excel 文件，系统将自动导入其中的提示词。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>没有模板？</span>
            <button
              onClick={handleDownloadTemplate}
              className="text-primary hover:underline cursor-pointer"
            >
              下载导入模板
            </button>
            <span>（含填写说明和示例）</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-file">选择文件</Label>
            <Input
              id="import-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                已选择：{file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? '导入中...' : '确认导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
