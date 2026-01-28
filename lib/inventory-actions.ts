'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'



export async function getProducts(query?: string) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query || '' } },
        { barcode: { contains: query || '' } },
      ],
    },
    include: {
      unit: true,
      category: true,
      inventory: {
        include: {
          branch: true,
        },
      },
    },
    take: 20,
  })
  return products
}

async function recordStockLog(tx: Prisma.TransactionClient, productId: string, branchId: string, quantityChange: number, type: string, note?: string) {
    const session = await auth()
    if (!session?.user) return

    const dbUser = await tx.user.findFirst({
        where: { 
            OR: [
                { email: session.user.email || undefined },
                { username: session.user.username || undefined }
            ]
        }
    })

    if (!dbUser) return

    const inv = await tx.inventory.findUnique({
        where: { productId_branchId: { productId, branchId } }
    })
    
    // Note: If this is called AFTER the update, the prevQuantity should be manually calculated 
    // or we fetch it BEFORE the update.
    // Let's assume we call it BEFORE the inventory update in the transaction.
    const prevQuantity = inv?.quantity || 0

    // Use a descriptive type or cast to bypass potentially stale Prisma types in the IDE
    const logData = {
            productId,
            branchId,
            userId: dbUser.id,
            quantityChange,
            type,
            prevQuantity,
            newQuantity: prevQuantity + quantityChange,
            note
        }

    await tx.stockLog.create({
        data: logData
    })
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const costPrice = parseFloat(formData.get('costPrice') as string || '0')
  const unitId = formData.get('unitId') as string
  const barcode = formData.get('barcode') as string
  const categoryId = formData.get('categoryId') as string
  const image = formData.get('image') as string

  await prisma.product.create({
    data: {
      name,
      price,
      costPrice,
      unitId: unitId || null,
      barcode: barcode || null,
      categoryId: categoryId || null,
      image: image || null,
    },
  })

  revalidatePath('/dashboard/products')
}

export async function addStock(formData: FormData) {
   const productId = formData.get('productId') as string
   const branchId = formData.get('branchId') as string
   const quantity = parseInt(formData.get('quantity') as string)
   const note = formData.get('note') as string || 'เติมสต็อก'

   await prisma.$transaction(async (tx) => {
     await recordStockLog(tx, productId, branchId, quantity, 'IN', note)
     
     await tx.inventory.upsert({
       where: {
         productId_branchId: {
           productId,
           branchId
         }
       },
       update: {
         quantity: { increment: quantity }
       },
       create: {
         productId,
         branchId,
         quantity
       }
     })
   })

   revalidatePath('/dashboard/products')
}

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const costPrice = parseFloat(formData.get('costPrice') as string || '0')
  const unitId = formData.get('unitId') as string
  const barcode = formData.get('barcode') as string
  const categoryId = formData.get('categoryId') as string
  const image = formData.get('image') as string

  await prisma.product.update({
    where: { id },
    data: {
      name,
      price,
      costPrice,
      unitId: unitId || null,
      barcode: barcode || null,
      categoryId: categoryId || null,
      image: image || null,
    },
  })

  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/pos')
}

export async function deleteProduct(id: string) {
  try {
    const ordersCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (ordersCount > 0) {
      return { 
        success: false, 
        error: 'ไม่สามารถลบสินค้าได้เนื่องจากมีการทำรายการขายไปแล้ว' 
      }
    }

    await prisma.product.delete({
      where: { id }
    })

    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard/pos')
    
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการลบสินค้า' 
    }
  }
}

export async function transferStock(formData: FormData) {
  const productId = formData.get('productId') as string
  const fromBranchId = formData.get('fromBranchId') as string
  const toBranchId = formData.get('toBranchId') as string
  const quantity = parseInt(formData.get('quantity') as string)

  if (fromBranchId === toBranchId) {
    throw new Error('สาขาต้นทางและปลายทางต้องเป็นคนละสาขากัน')
  }

  if (quantity <= 0) {
    throw new Error('จำนวนที่โอนต้องมากกว่า 0')
  }

  try {
    await prisma.$transaction(async (tx) => {
      const sourceInventory = await tx.inventory.findUnique({
        where: {
          productId_branchId: {
            productId,
            branchId: fromBranchId,
          },
        },
      })

      if (!sourceInventory || sourceInventory.quantity < quantity) {
        throw new Error('สต็อกในสาขาต้นทางไม่เพียงพอ')
      }

      // Record logs first
      await recordStockLog(tx, productId, fromBranchId, -quantity, 'TRANSFER_OUT', `โอนไปยังสาขาปลายทาง`)
      await recordStockLog(tx, productId, toBranchId, quantity, 'TRANSFER_IN', `รับโอนจากสาขาต้นทาง`)

      await tx.inventory.update({
        where: {
          productId_branchId: {
            productId,
            branchId: fromBranchId,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      })

      await tx.inventory.upsert({
        where: {
          productId_branchId: {
            productId,
            branchId: toBranchId,
          },
        },
        update: {
          quantity: {
            increment: quantity,
          },
        },
        create: {
          productId,
          branchId: toBranchId,
          quantity: quantity,
        },
      })
    })

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    console.error('Transfer error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโอนสต็อก' 
    }
  }
}

export async function getStockLogs(branchId?: string) {
  return await prisma.stockLog.findMany({
    where: branchId ? { branchId } : {},
    include: {
      product: {
        select: {
          name: true,
          unit: {
              select: { name: true }
          }
        }
      },
      branch: {
        select: {
          name: true
        }
      },
      user: {
        select: {
          name: true,
          username: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })
}
