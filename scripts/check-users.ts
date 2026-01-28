import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
          id: true,
          username: true,
          name: true,
          role: true,
          password: true
      }
    })
    console.log('--- DATABASE USERS ---')
    console.log(users.map(u => ({ ...u, hasPassword: !!u.password, password: u.password ? 'HIDDEN' : 'NONE' })))
    console.log('Total users:', users.length)
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
