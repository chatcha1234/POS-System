'use client'

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
import { addStock } from '@/lib/inventory-actions'
import { useState } from 'react'

export function AddStockDialog({ productId, branchId }: { productId: string, branchId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">เพิ่มสต็อก</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มสต็อกสินค้า</DialogTitle>
          <DialogDescription>
            เพิ่มจำนวนสินค้าสำหรับสาขานี้
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await addStock(formData)
            setOpen(false)
          }}
        >
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="branchId" value={branchId} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                จำนวน
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                หมายเหตุ
              </Label>
              <Input
                id="note"
                name="note"
                placeholder="เช่น เติมของรอบเช้า"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">อัปเดตสต็อก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
