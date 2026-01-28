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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Pencil, Loader2 } from 'lucide-react'
import { updateUserBranch, updateUserRole } from '@/lib/user-actions'

type Branch = {
    id: string
    name: string
}

type User = {
    id: string
    name: string | null
    username: string | null
    role: string
    branchId: string | null
}

interface UserEditDialogProps {
    user: User
    branches: Branch[]
}

export function UserEditDialog({ user, branches }: UserEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const branchId = formData.get('branchId') as string
    const role = formData.get('role') as string

    // Update Role
    if (role !== user.role) {
        await updateUserRole(user.id, role)
    }

    // Update Branch
    if (branchId !== (user.branchId || 'null')) {
        await updateUserBranch(user.id, branchId)
    }

    setIsLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
          <DialogDescription>
            ปรับเปลี่ยนตำแหน่งและสาขาสังกัดของ {user.name || user.username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              ตำแหน่ง
            </Label>
            <div className="col-span-3">
                <Select name="role" defaultValue={user.role}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">ผู้ดูแลระบบ (Admin)</SelectItem>
                        <SelectItem value="STAFF">พนักงานขาย (Staff)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="branchId" className="text-right">
              สาขา
            </Label>
            <div className="col-span-3">
                <Select name="branchId" defaultValue={user.branchId || 'null'}>
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกสาขา" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null" className="text-slate-500 font-medium">-- ไม่ระบุ / ส่วนกลาง --</SelectItem>
                        {branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
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
