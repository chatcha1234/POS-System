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
import { createProduct } from '@/lib/inventory-actions'
import { useState } from 'react'

export function AddProductDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>เพิ่มสินค้า</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
          <DialogDescription>
            ระบุรายละเอียดสินค้าที่ต้องการเพิ่มเข้าสู่ระบบ
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createProduct(formData)
            setOpen(false)
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ชื่อสินค้า
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                ราคาขาย
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPrice" className="text-right">
                ราคาต้นทุน
              </Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                className="col-span-3"
                defaultValue="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                หน่วยนับ
              </Label>
              <Input id="unit" name="unit" className="col-span-3" defaultValue="ชิ้น" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">
                บาร์โค้ด
              </Label>
              <Input id="barcode" name="barcode" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                หมวดหมู่
              </Label>
              <Input id="category" name="category" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">บันทึกสินค้า</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
