import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password', 10)

  // Create Branches
  const mainBranch = await prisma.branch.upsert({
    where: { id: 'branch-001' },
    update: {},
    create: {
      id: 'branch-001',
      name: 'Main Branch',
      location: '123 Main St',
    },
  })

  const secondBranch = await prisma.branch.upsert({
    where: { id: 'branch-002' },
    update: {},
    create: {
      id: 'branch-002',
      name: 'Second Branch',
      location: '456 Second Rd',
    },
  })

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: password,
      role: 'ADMIN',
      name: 'Admin User',
      branchId: mainBranch.id,
    },
  })

  console.log({ mainBranch, secondBranch, admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
