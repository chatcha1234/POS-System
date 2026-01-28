import { auth } from '@/auth'
import { getStockLogs } from '@/lib/inventory-actions'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

interface StockLogWithRelations {
  id: string
  productId: string
  branchId: string
  userId: string
  quantityChange: number
  type: string
  prevQuantity: number
  newQuantity: number
  note: string | null
  createdAt: Date
  product: {
    name: string
    unit: { name: string } | null
  }
  branch: {
    name: string
  }
  user: {
    name: string | null
    username: string
  }
}

export default async function InventoryLogsPage() {
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

  // Admins see all, Staff see only their branch
  const branchId = dbUser?.role === 'ADMIN' ? undefined : (dbUser?.branchId || 'branch-001')
  const logs = await getStockLogs(branchId) as unknown as StockLogWithRelations[]

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">รับสินค้าเข้า</Badge>
      case 'SALE': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">ขายสินค้า</Badge>
      case 'TRANSFER_IN': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">รับโอน</Badge>
      case 'TRANSFER_OUT': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">โอนออก</Badge>
      case 'ADJUSTMENT': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">ปรับสต็อก</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">ประวัติความเคลื่อนไหวสต็อก</h1>
      </div>

      <div className="bg-white rounded-md border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วัน-เวลา</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>เปลี่ยนแปลง</TableHead>
              <TableHead>คงเหลือใหม่</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>ผู้ดำเนินการ</TableHead>
              <TableHead>หมายเหตุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log: StockLogWithRelations) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(log.createdAt), 'dd MMM yy HH:mm', { locale: th })}
                </TableCell>
                <TableCell className="font-medium">{log.product.name}</TableCell>
                <TableCell>{getTypeBadge(log.type)}</TableCell>
                <TableCell className={log.quantityChange > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {log.quantityChange > 0 ? '+' : ''}{log.quantityChange} {log.product.unit?.name || 'ชิ้น'}
                </TableCell>
                <TableCell>{log.newQuantity} {log.product.unit?.name || 'ชิ้น'}</TableCell>
                <TableCell>{log.branch.name}</TableCell>
                <TableCell>{log.user.name || log.user.username}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{log.note || '-'}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">ไม่พบประวัติการเคลื่อนไหว</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
