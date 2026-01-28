import { auth } from '@/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getOrders } from '@/lib/pos-actions'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default async function SalesPage() {
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

  // If user is not ADMIN, only show current branch orders
  const branchId = dbUser?.role === 'ADMIN' ? undefined : dbUser?.branchId || undefined
  const orders = await getOrders(branchId)

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ประวัติการขาย</h1>
        <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
            <span className="text-sm text-muted-foreground">ยอดขายรวมทั้งหมด:</span>
            <span className="ml-2 text-xl font-bold text-primary">฿{totalSales.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-md border shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>เลขที่ออเดอร์</TableHead>
              <TableHead>วันที่-เวลา</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>พนักงาน</TableHead>
              <TableHead>รายการสินค้า</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                </TableCell>
                <TableCell>{order.branch.name}</TableCell>
                <TableCell>{order.user.name || order.user.username}</TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate text-sm">
                    {order.items.map(item => `${item.product.name} (x${item.quantity})`).join(', ')}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">
                  ฿{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        ยังไม่มีประวัติการขาย
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
