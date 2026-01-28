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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProduct } from '@/lib/inventory-actions'
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import with no SSR to prevent filesystem errors during build/hydration
const ImageUpload = dynamic(() => import('@/components/ui/image-upload'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
            Loading upload widget...
        </div>
    )
})

interface AddProductProps {
  categories: { id: string; name: string }[]
  units: { id: string; name: string }[]
}

export function AddProductDialog({ categories, units }: AddProductProps) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

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
            // Manually append image if it's not picked up by the hidden input for some reason
            // or ensure state is up to date. 
            // Better yet, just use the hidden input but make sure it has a key.
            if (imageUrl) {
                formData.set('image', imageUrl)
            }
            await createProduct(formData)
            setOpen(false)
            setImageUrl('')
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
              <Label htmlFor="unitId" className="text-right">
                หน่วยนับ
              </Label>
              <div className="col-span-3">
                <Select name="unitId" defaultValue={units[0]?.id}>
                  <SelectTrigger id="unitId">
                    <SelectValue placeholder="เลือกหน่วยนับ" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right">
                บาร์โค้ด
              </Label>
              <Input id="barcode" name="barcode" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">
                หมวดหมู่
              </Label>
              <div className="col-span-3">
                <Select name="categoryId" defaultValue={categories[0]?.id}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">รูปสินค้า</Label>
              <div className="col-span-3">
                <ImageUpload 
                    value={imageUrl} 
                    onChange={(url) => setImageUrl(url)} 
                />
                <input type="hidden" name="image" value={imageUrl} />
              </div>
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
