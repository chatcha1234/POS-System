'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  try {
    const p = prisma as any
    // Try singular 'setting' first, then plural 'settings'
    const model = p.setting || p.settings

    if (model) {
      let settings = await model.findUnique({
        where: { id: 'system' }
      })
      if (!settings) {
         settings = await model.create({
           data: { id: 'system', shopName: 'Construction POS' }
         })
      }
      return settings
    }

    // Fallback: Use Raw SQL if model is not found on client
    console.log('Using Raw SQL fallback for getSettings')
    const result = await prisma.$queryRaw`SELECT * FROM "Setting" WHERE id = 'system'` as any[]
    
    if (result.length > 0) {
      return result[0]
    } else {
      // Create with raw sql
      await prisma.$executeRaw`INSERT INTO "Setting" (id, "shopName", "updatedAt") VALUES ('system', 'Construction POS', NOW())`
      return { id: 'system', shopName: 'Construction POS' }
    }

  } catch (error) {
    console.error('Error in getSettings:', error)
    // Absolute fallback
    return { id: 'system', shopName: 'Construction POS' }
  }
}

export async function updateShopName(formData: FormData) {
  const shopName = formData.get('shopName') as string
  if (!shopName) return { error: 'กรุณาระบุชื่อร้าน' }

  try {
    const p = prisma as any
    const model = p.setting || p.settings

    if (model) {
       await model.upsert({
        where: { id: 'system' },
        update: { shopName },
        create: { id: 'system', shopName }
      })
    } else {
       // Fallback: Raw SQL
       console.log('Using Raw SQL fallback for updateShopName')
       await prisma.$executeRaw`
         INSERT INTO "Setting" (id, "shopName", "updatedAt") 
         VALUES ('system', ${shopName}, NOW()) 
         ON CONFLICT (id) 
         DO UPDATE SET "shopName" = ${shopName}, "updatedAt" = NOW()
       `
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    
    return { success: true }
  } catch (error) {
    console.error('Update shop name error:', error)
    return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error instanceof Error ? error.message : String(error)) }
  }
}
