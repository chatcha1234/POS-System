import { auth } from '@/auth'
import { CartProvider } from '@/components/pos/cart-context'
import { BranchSwitcher } from '@/components/layout/branch-switcher'
import { getBranches } from '@/lib/inventory-actions'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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

  return (
    <CartProvider>
        <div className="min-h-screen flex flex-col">
        <header className="border-b bg-white dark:bg-black p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="font-bold text-xl">Construction POS</Link>
                <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
                    <Link href="/dashboard" className="hover:text-primary transition">ภาพรวม</Link>
                    <Link href="/dashboard/products" className="hover:text-primary transition">สินค้า & สต็อก</Link>
                    <Link href="/dashboard/inventory-logs" className="hover:text-primary transition">ประวัติสต็อก</Link>
                    <Link href="/dashboard/sales" className="hover:text-primary transition">ประวัติการขาย</Link>
                    <Link href="/dashboard/pos" className="hover:text-primary transition text-primary">ขายหน้าร้าน</Link>
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
