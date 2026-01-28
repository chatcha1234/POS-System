import { auth } from '@/auth'
import { POSClient } from '@/components/pos/pos-client'
import { prisma } from '@/lib/prisma'
import { getProducts } from '@/lib/inventory-actions'
import { redirect } from 'next/navigation'

export default async function POSPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Fetch dbUser to get branchId
  // Note: session.user might have branchId if we added it to the session callback, 
  // but fetching it here is safer if it's not in the token.
  const dbUser = await prisma.user.findFirst({
      where: { 
          OR: [
              { email: session.user.email || undefined },
              { username: session.user.username || undefined }
          ]
      }
  })

  // fallback to main branch if user has no branch (should not happen in real app)
  const branchId = dbUser?.branchId || 'branch-001'
  const userId = dbUser?.id || ''

  // Optimize: Fetch products on server side for initial render
  const initialProducts = await getProducts()

  return <POSClient userId={userId} branchId={branchId} initialProducts={initialProducts} />
}
