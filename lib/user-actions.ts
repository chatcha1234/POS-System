'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        branch: {
            select: { name: true }
        }
    }
  })
}

export async function updateUserBranch(userId: string, branchId: string | null) {
  try {
    await prisma.user.update({
        where: { id: userId },
        data: { branchId: branchId === 'null' ? null : branchId }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    console.error('Update user branch error:', error)
    return { success: false, error: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้' }
  }
}

export async function updateUserRole(userId: string, role: string) {
    try {
      await prisma.user.update({
          where: { id: userId },
          data: { role }
      })
  
      revalidatePath('/dashboard/users')
      return { success: true }
    } catch (error) {
      console.error('Update user role error:', error)
      return { success: false, error: 'ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้' }
    }
  }
