import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'
import { MapPin, Plus, Building2 } from 'lucide-react'
import { createBranch, getBranches } from '@/lib/branch-actions'
import { DeleteBranchButton } from '@/components/branches/delete-branch-button'
import { BranchEditDialog } from '@/components/branches/branch-edit-dialog'

type Branch = {
    id: string;
    name: string;
    location: string | null;
    createdAt: Date;
}

export default async function BranchesPage() {
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

  if (dbUser?.role !== 'ADMIN') {
      redirect('/dashboard')
  }

  const branches = await getBranches()

  return (
    <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">จัดการสาขา</h1>
            <p className="text-muted-foreground">เพิ่ม ลบ และจัดการข้อมูลสาขาทั้งหมดในระบบ</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 border-none shadow-premium bg-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                เพิ่มสาขาใหม่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBranch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ชื่อสาขา</label>
                <Input name="name" placeholder="ระบุชื่อสาขา เช่น สาขาหลัก" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">สถานที่ / ที่อยู่</label>
                <Input name="location" placeholder="ระบุที่อยู่สาขา" />
              </div>
              <Button type="submit" className="w-full font-bold h-11">
                บันทึกสาขา
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-premium bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="py-4 font-bold text-slate-700">ชื่อสาขา</TableHead>
                <TableHead className="py-4 font-bold text-slate-700">สถานที่</TableHead>
                <TableHead className="py-4 font-bold text-slate-700">วันที่ตั้ง</TableHead>
                <TableHead className="text-right pr-6 py-4 font-bold text-slate-700">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch: Branch) => (
                <TableRow key={branch.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="font-bold text-slate-900">{branch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-slate-500">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {branch.location || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-slate-400 text-sm">
                    {new Date(branch.createdAt).toLocaleDateString('th-TH')}
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6 flex justify-end gap-1">
                    <BranchEditDialog branch={branch} />
                    <DeleteBranchButton id={branch.id} />
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-slate-400">
                        ยังไม่มีข้อมูลสาขาในระบบ
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
