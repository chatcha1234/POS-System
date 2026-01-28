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
import { updateProduct, deleteProduct } from '@/lib/inventory-actions'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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

interface EditProductDialogProps {
    product: {
        id: string
        name: string
        price: number
        costPrice: number
        unitId: string | null
        barcode: string | null
        categoryId: string | null
        image: string | null
    }
    categories: { id: string; name: string }[]
    units: { id: string; name: string }[]
}

export function EditProductDialog({ product, categories, units }: EditProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageUrl, setImageUrl] = useState(product.image || '')

  const handleDelete = async () => {
      if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้าชิ้นนี้?')) {
          setIsDeleting(true)
          try {
              const result = await deleteProduct(product.id)
              if (result?.success) {
                  setOpen(false)
              } else {
                  alert(result?.error || 'เกิดข้อผิดพลาดในการลบสินค้า')
              }
          } catch (error) {
              console.error('Delete error in UI:', error)
              alert('เกิดข้อผิดพลาดในการลบสินค้า')
          } finally {
              setIsDeleting(false)
          }
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสินค้า</DialogTitle>
          <DialogDescription>
            แก้ไขรายละเอียดของสินค้าและบันทึกการเปลี่ยนแปลง
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            if (imageUrl) {
                formData.set('image', imageUrl)
            }
            await updateProduct(formData)
            setOpen(false)
          }}
        >
          <input type="hidden" name="id" value={product.id} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ชื่อสินค้า
              </Label>
              <Input id="name" name="name" defaultValue={product.name} className="col-span-3" required />
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
                defaultValue={product.price}
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
                defaultValue={product.costPrice}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitId" className="text-right">
                หน่วยนับ
              </Label>
              <div className="col-span-3">
                <Select name="unitId" defaultValue={product.unitId || undefined}>
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
              <Input id="barcode" name="barcode" defaultValue={product.barcode || ''} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">
                หมวดหมู่
              </Label>
              <div className="col-span-3">
                <Select name="categoryId" defaultValue={product.categoryId || undefined}>
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
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
                <Button type="submit">บันทึก</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
