import { auth } from '@/auth'
import { AddProductDialog } from '@/components/inventory/add-product-dialog'
import { AddStockDialog } from '@/components/inventory/add-stock-dialog'
import { EditProductDialog } from '@/components/inventory/edit-product-dialog'
import { TransferStockDialog } from '@/components/inventory/transfer-stock-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts } from '@/lib/inventory-actions'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AlertCircle, AlertTriangle, Package, PackageCheck } from 'lucide-react'

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

  const products = await getProducts()
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
    unit: string | null
    barcode: string | null
    category: string | null
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
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">คลังสินค้า</h1>
        <AddProductDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายการสินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">รายการ</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">สินค้าสต็อกต่ำ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">เหลือน้อยกว่า {LOW_STOCK_THRESHOLD} ชิ้น</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนสต็อกรวม</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ชิ้น (สาขาปัจจุบัน)</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-md border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>บาร์โค้ด</TableHead>
              {isAdmin && <TableHead>ราคาต้นทุน</TableHead>}
              <TableHead>ราคาขาย</TableHead>
              <TableHead>หน่วยนับ</TableHead>
              <TableHead>สต็อก (สาขาของคุณ)</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(products as unknown as ExtendedProduct[]).map((product) => {
              const stock = product.inventory.find(
                (i) => i.branchId === usersBranchId
              )?.quantity || 0
              const isLowStock = stock < LOW_STOCK_THRESHOLD

              return (
                <TableRow key={product.id} className={isLowStock ? 'bg-red-50/50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{product.name}</span>
                        {isLowStock && (
                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> สต็อกต่ำ
                            </span>
                        )}
                    </div>
                  </TableCell>
                   <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>{product.barcode || '-'}</TableCell>
                  {isAdmin && <TableCell className="text-muted-foreground italic">฿{(product.costPrice ?? 0).toFixed(2)}</TableCell>}
                  <TableCell>฿{(product.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{product.unit || 'ชิ้น'}</TableCell>
                  <TableCell>
                    <span className={isLowStock ? 'text-red-600 font-bold' : ''}>
                        {stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <AddStockDialog productId={product.id} branchId={usersBranchId} />
                        <TransferStockDialog 
                            productId={product.id} 
                            productName={product.name} 
                            currentBranchId={usersBranchId} 
                        />
                        <EditProductDialog product={product} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {products.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">ไม่พบข้อมูลสินค้า</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
