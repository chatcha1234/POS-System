import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store } from 'lucide-react'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
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


  return (
    <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">ตั้งค่าระบบ</h1>
          <p className="text-muted-foreground">จัดการข้อมูลพื้นฐานและชื่อร้านค้าของคุณ</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-none shadow-premium bg-white overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 pb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                   <CardTitle className="text-xl font-bold">ข้อมูลร้านค้า</CardTitle>
                   <CardDescription>ชื่อร้านของคุณจะปรากฏบนหัวข้อและใบเสร็จ</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8">
            <SettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
