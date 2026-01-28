import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'
import { Users, ShieldCheck, Store } from 'lucide-react'
import { getUsers } from '@/lib/user-actions'
import { getBranches } from '@/lib/branch-actions'
import { UserEditDialog } from '@/components/users/user-edit-dialog'

export default async function UsersPage() {
  const session = await auth()
  
  if (!session?.user) redirect('/login')

  const dbUser = await prisma.user.findFirst({
      where: { 
          OR: [
              { email: session.user.email || undefined },
              { username: session.user.username || undefined }
          ]
      }
  })

  // Role Protection
  if (dbUser?.role !== 'ADMIN') redirect('/dashboard')

  const [users, branches] = await Promise.all([
      getUsers(),
      getBranches()
  ])

  return (
    <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">จัดการพนักงาน</h1>
            <p className="text-muted-foreground">บริหารจัดการสิทธิ์ผู้ใช้งานและการเข้าถึงสาขา</p>
        </div>
      </div>

      <Card className="border-none shadow-premium bg-white overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Users className="h-5 w-5 text-primary" />
                <span>รายชื่อผู้ใช้งานทั้งหมด ({users.length})</span>
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-4 font-bold text-slate-700 w-[300px]">ชื่อผู้ใช้งาน</TableHead>
              <TableHead className="py-4 font-bold text-slate-700">ตำแหน่ง</TableHead>
              <TableHead className="py-4 font-bold text-slate-700">สังกัดสาขา</TableHead>
              <TableHead className="py-4 font-bold text-slate-700">วันที่สมัคร</TableHead>
              <TableHead className="text-right pr-6 py-4 font-bold text-slate-700">แก้ไข</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                          {(user.name || user.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{user.name || user.username}</span>
                        <span className="text-xs text-slate-500">{user.email || user.username}</span>
                      </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                      {user.role === 'ADMIN' ? <ShieldCheck className="h-3 w-3" /> : null}
                      {user.role}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className={`flex items-center gap-2 text-sm ${user.branch ? 'text-slate-700 font-semibold' : 'text-slate-400 italic'}`}>
                    <Store className="h-4 w-4 opacity-50" />
                    {user.branch?.name || 'ไม่ระบุ / ส่วนกลาง'}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-slate-500 text-sm">
                  {new Date(user.createdAt).toLocaleDateString('th-TH')}
                </TableCell>
                <TableCell className="py-4 text-right pr-6">
                    <UserEditDialog user={user} branches={branches} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
