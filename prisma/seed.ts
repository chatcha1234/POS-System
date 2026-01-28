import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password', 10)

  // 1. Create Branches
  console.log('🌱 Seeding branches...')
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

  // 2. Create Admin User
  console.log('👤 Seeding admin user...')
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
      name: 'Admin User',
      branchId: mainBranch.id,
    },
  })

  // 3. Create Master Data (Categories & Units)
  console.log('📑 Seeding categories...')
  const categories = ['วัสดุพื้นฐาน', 'เหล็ก', 'สี', 'เครื่องมือช่าง']
  const categoryMap: Record<string, string> = {}
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categoryMap[name] = cat.id
  }

  console.log('📏 Seeding units...')
  const units = ['ถุง', 'คิว', 'เส้น', 'ถัง', 'ชิ้น', 'กล่อง']
  const unitMap: Record<string, string> = {}
  for (const name of units) {
    const u = await prisma.unit.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    unitMap[name] = u.id
  }

  // 4. Create sample products
  console.log('📦 Seeding products...')
  const sampleProducts = [
    {
      name: 'ปูนซีเมนต์ถุง 50กก.',
      price: 145,
      costPrice: 120,
      unitName: 'ถุง',
      categoryName: 'วัสดุพื้นฐาน',
      barcode: '1001',
    },
    {
      name: 'ทรายหยาบ (คิว)',
      price: 550,
      costPrice: 400,
      unitName: 'คิว',
      categoryName: 'วัสดุพื้นฐาน',
      barcode: '1002',
    },
    {
      name: 'เหล็กเส้น 9มม. (SD40)',
      price: 185,
      costPrice: 150,
      unitName: 'เส้น',
      categoryName: 'เหล็ก',
      barcode: '1003',
    },
    {
      name: 'สีทาภายใน Extra (5 แกลลอน)',
      price: 1850,
      costPrice: 1400,
      unitName: 'ถัง',
      categoryName: 'สี',
      barcode: '1004',
    },
  ]

  for (const p of sampleProducts) {
    const product = await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {
          name: p.name,
          price: p.price,
          costPrice: p.costPrice,
          categoryId: categoryMap[p.categoryName],
          unitId: unitMap[p.unitName],
      },
      create: {
          name: p.name,
          barcode: p.barcode,
          price: p.price,
          costPrice: p.costPrice,
          categoryId: categoryMap[p.categoryName],
          unitId: unitMap[p.unitName],
      },
    })

    // Update inventory for each branch
    const branches = [mainBranch, secondBranch]
    for (const branch of branches) {
       await prisma.inventory.upsert({
           where: { productId_branchId: { productId: product.id, branchId: branch.id } },
           update: {},
           create: {
               productId: product.id,
               branchId: branch.id,
               quantity: branch.id === mainBranch.id ? 50 : 20
           }
       })
    }
    console.log(`- ${product.name} (Barcode: ${product.barcode})`)
  }

  console.log('✅ Seeding completed!')
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
