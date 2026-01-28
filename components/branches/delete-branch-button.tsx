'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteBranch } from '@/lib/branch-actions'

type DeleteBranchButtonProps = {
  id: string
}

export function DeleteBranchButton({ id }: DeleteBranchButtonProps) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    if (!confirm('ยืนยันที่จะลบสาขานี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return
    }

    setIsPending(true)
    try {
      const result = await deleteBranch(id)
      if (!result.success) {
        alert(result.error)
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการลบสาขา')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
          <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
