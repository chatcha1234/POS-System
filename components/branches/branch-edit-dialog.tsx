'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Loader2 } from 'lucide-react'
import { updateBranch } from '@/lib/branch-actions'

type Branch = {
    id: string
    name: string
    location: string | null
}

interface BranchEditDialogProps {
    branch: Branch
}

export function BranchEditDialog({ branch }: BranchEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
        await updateBranch(formData)
        setOpen(false)
    } catch {
        alert('ไม่สามารถอัปเดตข้อมูลสาขาได้')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสาขา</DialogTitle>
          <DialogDescription>
            ปรับเปลี่ยนชื่อสาขาและสถานที่ตั้งของ {branch.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={branch.id} />
          <div className="grid gap-2">
            <Label htmlFor="name">ชื่อสาขา</Label>
            <Input id="name" name="name" defaultValue={branch.name} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">สถานที่ / ที่อยู่</Label>
            <Input id="location" name="location" defaultValue={branch.location || ''} />
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
