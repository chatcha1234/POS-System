'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings2, Trash2 } from 'lucide-react'
import { 
    addCategory, deleteCategory, 
    addUnit, deleteUnit 
} from '@/lib/master-data-actions'

interface MasterDataProps {
  categories: { id: string; name: string; _count?: { products: number } }[]
  units: { id: string; name: string; _count?: { products: number } }[]
}

export function MasterDataManagement({ categories, units }: MasterDataProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    await addCategory(newName)
    setNewName('')
  }

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    await addUnit(newName)
    setNewName('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>จัดการประเภทสินค้าและหน่วยนับ</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">ประเภทสินค้า</TabsTrigger>
            <TabsTrigger value="units">หน่วยนับ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4 py-4">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <Input 
                placeholder="ชื่อประเภทสินค้าใหม่" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button type="submit">เพิ่ม</Button>
            </form>
            <div className="border rounded-md divide-y max-h-[300px] overflow-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3">
                  <span>{cat.name} ({cat._count?.products || 0})</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={async () => {
                        if (confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทสินค้านี้?')) {
                            await deleteCategory(cat.id)
                        }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="units" className="space-y-4 py-4">
            <form onSubmit={handleAddUnit} className="flex gap-2">
              <Input 
                placeholder="ชื่อหน่วยนับใหม่" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button type="submit">เพิ่ม</Button>
            </form>
            <div className="border rounded-md divide-y max-h-[300px] overflow-auto">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-3">
                  <span>{unit.name} ({unit._count?.products || 0})</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={async () => {
                         if (confirm('คุณแน่ใจหรือไม่ที่จะลบหน่วยนับนี้?')) {
                            await deleteUnit(unit.id)
                        }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
