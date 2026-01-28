import { auth } from '@/auth'
import { AddProductDialog } from '@/components/inventory/add-product-dialog'
import { AddStockDialog } from '@/components/inventory/add-stock-dialog'
import { EditProductDialog } from '@/components/inventory/edit-product-dialog'
import { TransferStockDialog } from '@/components/inventory/transfer-stock-dialog'
import { MasterDataManagement } from '@/components/inventory/master-data-management'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts } from '@/lib/inventory-actions'
import { getCategories, getUnits } from '@/lib/master-data-actions'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AlertCircle, AlertTriangle, Package, PackageCheck, ImageIcon } from 'lucide-react'

const LOW_STOCK_THRESHOLD = 10

export default async function ProductsPage() {
  const session = await auth()
  
  if (!session?.user) {
      redirect('/login')
  }

  const dbUser = await prisma.user.findFirst({
      where: { 
          OR: [
              { email: session.user.email || undefined },
              { username: session.user.username || undefined }
          ]
      }
  })

  // Fetch all data
  const [products, categories, units] = await Promise.all([
      getProducts(),
      getCategories(),
      getUnits(),
  ])

  const usersBranchId = dbUser?.branchId || 'branch-001'
  const isAdmin = dbUser?.role === 'ADMIN'
  
  interface DashboardStats {
    totalProducts: number
    totalStock: number
    lowStockItems: number
  }

  interface ExtendedProduct {
    id: string
    name: string
    price: number
    costPrice: number
    unitId: string | null
    unit: { id: string; name: string } | null
    barcode: string | null
    categoryId: string | null
    category: { id: string; name: string } | null
    image: string | null
    inventory: Array<{
      branchId: string
      quantity: number
    }>
  }

  // Calculate Stats
  const stats = (products as unknown as ExtendedProduct[]).reduce((acc: DashboardStats, product: ExtendedProduct) => {
    const stock = product.inventory.find((i) => i.branchId === usersBranchId)?.quantity || 0
    acc.totalProducts += 1
    acc.totalStock += stock
    if (stock < LOW_STOCK_THRESHOLD) {
      acc.lowStockItems += 1
    }
    return acc
  }, { totalProducts: 0, totalStock: 0, lowStockItems: 0 })

  return (
    <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">คลังสินค้า</h1>
            <p className="text-muted-foreground">จัดการรายการสินค้าและสต็อกในสาขาของคุณ</p>
        </div>
        <div className="flex items-center gap-3">
            <MasterDataManagement categories={categories} units={units} />
            <AddProductDialog categories={categories} units={units} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-none shadow-premium bg-white group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Package className="h-20 w-20 text-indigo-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">รายการทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800">{stats.totalProducts}</div>
            <div className="mt-2 flex items-center text-xs font-medium text-indigo-600">
               <span className="bg-indigo-50 px-2 py-0.5 rounded-full">แอคทีฟอยู่ในระบบ</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-premium bg-white group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <AlertTriangle className="h-20 w-20 text-orange-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">สินค้าสต็อกต่ำ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-orange-600">{stats.lowStockItems}</div>
            <p className="mt-2 text-xs font-medium text-orange-500">
                ต้องการการเติมสต็อกด่วน
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-premium bg-white group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <PackageCheck className="h-20 w-20 text-emerald-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">สต็อกรวมทั้งสาขา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600">{stats.totalStock.toLocaleString()}</div>
            <p className="mt-2 text-xs font-medium text-emerald-500">
                พร้อมจำหน่ายในสาขานี้
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-premium">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-[80px] py-5 font-bold text-slate-700">รูปภาพ</TableHead>
              <TableHead className="font-bold text-slate-700">ข้อมูลสินค้า</TableHead>
              <TableHead className="font-bold text-slate-700">หมวดหมู่</TableHead>
              {isAdmin && <TableHead className="font-bold text-slate-700">ราคาต้นทุน</TableHead>}
              <TableHead className="font-bold text-slate-700">ราคาขาย</TableHead>
              <TableHead className="font-bold text-slate-700">คงเหลือ</TableHead>
              <TableHead className="text-right pr-8 font-bold text-slate-700">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(products as unknown as ExtendedProduct[]).map((product) => {
              const stock = product.inventory.find(
                (i) => i.branchId === usersBranchId
              )?.quantity || 0
              const isLowStock = stock < LOW_STOCK_THRESHOLD

              return (
                <TableRow key={product.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                  <TableCell className="py-4">
                    {product.image ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                            <Image 
                              src={product.image} 
                              alt={product.name} 
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                            <ImageIcon className="h-7 w-7" />
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base">{product.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 tabular-nums font-medium">#{product.barcode || 'NO-BARCODE'}</span>
                        </div>
                    </div>
                  </TableCell>
                   <TableCell className="py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100/50">
                            {product.category?.name || 'ทั่วไป'}
                        </span>
                   </TableCell>
                  {isAdmin && <TableCell className="py-4 tabular-nums text-slate-500 italic">฿{(product.costPrice ?? 0).toFixed(2)}</TableCell>}
                  <TableCell className="py-4 tabular-nums font-bold text-slate-900">฿{(product.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                        <span className={`text-sm font-black tabular-nums ${isLowStock ? 'text-orange-600' : 'text-slate-700'}`}>
                            {stock.toLocaleString()} <span className="text-[10px] text-muted-foreground font-medium uppercase">{product.unit?.name || 'ชิ้น'}</span>
                        </span>
                        {isLowStock && (
                            <span className="text-[9px] text-orange-600 font-extrabold flex items-center gap-0.5 uppercase tracking-tighter">
                                <AlertCircle className="h-2.5 w-2.5" /> ใกล้หมด
                            </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddStockDialog productId={product.id} branchId={usersBranchId} />
                        <TransferStockDialog 
                            productId={product.id} 
                            productName={product.name} 
                            currentBranchId={usersBranchId} 
                        />
                        <EditProductDialog 
                            product={product} 
                            categories={categories}
                            units={units}
                        />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {products.length === 0 && (
                <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">ไม่พบข้อมูลสินค้า</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
