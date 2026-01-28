'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'

// Categories
export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
        _count: {
            select: { products: true }
        }
    }
  })
}

export async function addCategory(name: string) {
  await prisma.category.create({
    data: { name },
  })
  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard/inventory')
}

export async function updateCategory(id: string, name: string) {
  await prisma.category.update({
    where: { id },
    data: { name },
  })
  revalidatePath('/dashboard/products')
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id },
  })
  revalidatePath('/dashboard/products')
}

// Units
export async function getUnits() {
  return await prisma.unit.findMany({
    orderBy: { name: 'asc' },
    include: {
        _count: {
            select: { products: true }
        }
    }
  })
}

export async function addUnit(name: string) {
  await prisma.unit.create({
    data: { name },
  })
  revalidatePath('/dashboard/products')
}

export async function updateUnit(id: string, name: string) {
  await prisma.unit.update({
    where: { id },
    data: { name },
  })
  revalidatePath('/dashboard/products')
}

export async function deleteUnit(id: string) {
  await prisma.unit.delete({
    where: { id },
  })
  revalidatePath('/dashboard/products')
}
