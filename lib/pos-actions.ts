'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type CheckoutItem = {
  id: string
  quantity: number
  price: number
}

export async function processTransaction(
  items: CheckoutItem[],
  userId: string,
  branchId: string
) {
  if (items.length === 0) {
    throw new Error('กรุณาเลือกสินค้าในตะกร้า')
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Calculate total
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          userId,
          branchId,
          total,
          status: 'COMPLETED',
          items: {
            create: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      // 3. Update Inventory for each item
      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: {
            productId_branchId: {
              productId: item.id,
              branchId: branchId,
            },
          },
        })

        if (!inventory || inventory.quantity < item.quantity) {
          const product = await tx.product.findUnique({ where: { id: item.id } })
          throw new Error(`สินค้า "${product?.name}" มีสต็อกไม่เพียงพอ (คงเหลือ: ${inventory?.quantity || 0})`)
        }

        // Record SALE log
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).stockLog.create({
          data: {
            productId: item.id,
            branchId: branchId,
            userId: userId,
            quantityChange: -item.quantity,
            type: 'SALE',
            prevQuantity: inventory.quantity,
            newQuantity: inventory.quantity - item.quantity,
            note: `ขายสินค้าออเดอร์ #${order.id}`
          }
        })

        await tx.inventory.update({
          where: {
            productId_branchId: {
              productId: item.id,
              branchId: branchId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })
      }

      return order
    })

    revalidatePath('/dashboard/pos')
    revalidatePath('/dashboard/products')
    return { success: true, orderId: result.id }
  } catch (error) {
    console.error('Transaction error:', error)
    return { 
        success: false, 
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการชำระเงิน' 
    }
  }
}

export async function getOrders(branchId?: string) {
  return await prisma.order.findMany({
    where: branchId ? { branchId } : {},
    include: {
      user: {
        select: {
          name: true,
          username: true,
        },
      },
      branch: {
        select: {
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
