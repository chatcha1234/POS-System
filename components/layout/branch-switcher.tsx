'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { switchActiveBranch } from '@/lib/branch-actions'
import { Store } from 'lucide-react'

interface Branch {
  id: string
  name: string
}

interface BranchSwitcherProps {
  userId: string
  currentBranchId: string
  branches: Branch[]
}

export function BranchSwitcher({ userId, currentBranchId, branches }: BranchSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSwitch = async (branchId: string) => {
    if (branchId === currentBranchId) return
    
    setIsLoading(true)
    const result = await switchActiveBranch(userId, branchId)
    setIsLoading(false)
    
    if (!result.success) {
      alert(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border shadow-sm">
      <Store className="h-4 w-4 text-zinc-500" />
      <Select
        defaultValue={currentBranchId}
        onValueChange={handleSwitch}
        disabled={isLoading}
      >
        <SelectTrigger className="h-7 border-none bg-transparent focus:ring-0 text-xs font-semibold p-0 w-[140px]">
          <SelectValue placeholder="เลือกสาขา" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
