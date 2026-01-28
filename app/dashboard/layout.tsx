import { auth } from '@/auth'
import { CartProvider } from '@/components/pos/cart-context'
import { BranchSwitcher } from '@/components/layout/branch-switcher'
import { getBranches } from '@/lib/branch-actions'
import { getSettings } from '@/lib/settings-actions'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Package, History, Receipt, ShoppingCart, Settings as SettingsIcon, Building2, Users } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const branches = dbUser?.role === 'ADMIN' ? await getBranches() : []
  const settings = await getSettings()
  const currentBranch = dbUser?.branchId 
    ? await prisma.branch.findUnique({ where: { id: dbUser.branchId } })
    : null

  return (
    <CartProvider>
        <div className="min-h-screen flex flex-col">
        <header className="border-b bg-white dark:bg-black p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex flex-col -space-y-1 group">
                    <span className="text-primary tracking-tighter uppercase font-black text-xl group-hover:scale-105 transition-transform origin-left">
                        {currentBranch?.name || settings.shopName.split(' ')[0]}
                    </span>
                    <span className="text-slate-700 font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                        {currentBranch ? 'BRANCH' : (settings.shopName.split(' ').slice(1).join(' ') || 'POS')}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase pt-0.5">{currentBranch ? settings.shopName : 'ADMIN PANEL'}</span>
                </Link>
                <nav className="flex gap-1 text-sm font-semibold">
                    <Link href="/dashboard" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        ภาพรวม
                    </Link>
                    <Link href="/dashboard/products" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        สินค้า & สต็อก
                    </Link>
                    <Link href="/dashboard/inventory-logs" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                        <History className="h-4 w-4" />
                        ประวัติสต็อก
                    </Link>
                    <Link href="/dashboard/sales" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        ประวัติการขาย
                    </Link>
                    {dbUser?.role === 'ADMIN' && (
                        <>
                            <Link href="/dashboard/branches" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                                <Building2 className="h-4 w-4 font-bold" />
                                จัดการสาขา
                            </Link>
                            <Link href="/dashboard/users" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                พนักงาน
                            </Link>
                            <Link href="/dashboard/settings" className="px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary transition flex items-center gap-2">
                                <SettingsIcon className="h-4 w-4" />
                                ตั้งค่า
                            </Link>
                        </>
                    )}
                    <Link href="/dashboard/pos" className="ml-4 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition flex items-center gap-2 font-black">
                        <ShoppingCart className="h-4 w-4" />
                        ขายหน้าร้าน
                    </Link>
                </nav>
            </div>
            <div className="flex items-center gap-4">
               {dbUser?.role === 'ADMIN' && (
                 <BranchSwitcher 
                   userId={dbUser.id} 
                   currentBranchId={dbUser.branchId || ''} 
                   branches={branches} 
                 />
               )}
               <span className="text-sm text-zinc-500">
                  {session.user.name || session.user.email} 
               </span>
               <form action={async () => {
                   'use server'
                   const { signOut } = await import('@/auth')
                   await signOut()
               }}>
                   <button className="text-sm font-medium hover:underline text-red-500">ออกจากระบบ</button>
               </form>
            </div>
        </header>
        <main className="flex-1 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            {children}
        </main>
        </div>
    </CartProvider>
  )
}
