'use client'

import { useState, useEffect } from 'react'
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
import { ArrowRightLeft } from 'lucide-react'
import { transferStock, getBranches } from '@/lib/inventory-actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TransferStockDialogProps {
  productId: string
  productName: string
  currentBranchId: string
}

export function TransferStockDialog({ 
  productId, 
  productName,
  currentBranchId 
}: TransferStockDialogProps) {
  const [open, setOpen] = useState(false)
  const [branches, setBranches] = useState<{id: string, name: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      getBranches().then(setBranches)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="โอนย้ายสินค้า">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>โอนย้ายสินค้า</DialogTitle>
          <DialogDescription>
            โอนสินค้า &quot;{productName}&quot; จากสาขาปัจจุบันไปยังสาขาอื่น
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            setIsLoading(true)
            const result = await transferStock(formData)
            setIsLoading(false)
            if (result.success) {
              setOpen(false)
            } else {
              alert(result.error)
            }
          }}
        >
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="fromBranchId" value={currentBranchId} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="toBranchId">สาขาปลายทาง</Label>
              <Select name="toBranchId" required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขาปลายทาง" />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    .filter(b => b.id !== currentBranchId)
                    .map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">จำนวนที่ต้องการโอน</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'กำลังโอน...' : 'ยืนยันการโอน'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
