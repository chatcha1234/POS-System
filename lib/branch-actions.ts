'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getBranches() {
  return await prisma.branch.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createBranch(formData: FormData) {
  const name = formData.get('name') as string
  const location = formData.get('location') as string

  await prisma.branch.create({
    data: { name, location }
  })

  revalidatePath('/dashboard/branches')
  revalidatePath('/dashboard')
}

export async function updateBranch(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const location = formData.get('location') as string

  await prisma.branch.update({
    where: { id },
    data: { name, location }
  })

  revalidatePath('/dashboard/branches')
  revalidatePath('/dashboard')
}

export async function deleteBranch(id: string) {
  // 1. Check for Orders (Safety First: Do not delete sales history automatically)
  const ordersCount = await prisma.order.count({ where: { branchId: id } })
  if (ordersCount > 0) {
    return { 
      success: false, 
      error: 'ไม่สามารถลบสาขาได้เนื่องจากมี "ประวัติการขาย" อยู่ในระบบ (กรุณาลบรายการขายก่อน หากต้องการลบสาขานี้จริง)' 
    }
  }

  try {
    // 2. Unassign Users (Set branchId to null)
    await prisma.user.updateMany({
      where: { branchId: id },
      data: { branchId: null }
    })

    // 3. Delete Inventory (Stock belongs to the branch, so it goes with it)
    await prisma.inventory.deleteMany({
      where: { branchId: id }
    })

    // 4. Delete Stock Logs
    await prisma.stockLog.deleteMany({
      where: { branchId: id }
    })

    // 5. Finally, Delete the Branch
    await prisma.branch.delete({ where: { id } })
    
    revalidatePath('/dashboard/branches')
    return { success: true }
  } catch (error) {
    console.error('Delete branch error:', error)
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบสาขา'
    }
  }
}

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
