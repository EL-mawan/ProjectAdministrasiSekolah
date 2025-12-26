import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.user.count()
  const users = await prisma.user.findMany({ select: { email: true, name: true } })
  console.log('--- DATABASE PROBE ---')
  console.log('User count:', count)
  console.log('Users:', JSON.stringify(users, null, 2))
  console.log('----------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
