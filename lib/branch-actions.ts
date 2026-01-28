'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function switchActiveBranch(userId: string, branchId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { branchId },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard/pos')
    revalidatePath('/dashboard/sales')
    
    return { success: true }
  } catch (error) {
    console.error('Switch branch error:', error)
    return { 
      success: false, 
      error: 'ไม่สามารถเปลี่ยนสาขาได้' 
    }
  }
}
