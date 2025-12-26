import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const school = await prisma.school.findFirst({ where: { isActive: true } })
  const userCount = await prisma.user.count()
  console.log('Database Info from .env:')
  console.log('-------------------------')
  console.log('School ID:', school?.id)
  console.log('School Name:', school?.name)
  console.log('User Count:', userCount)
}
main().finally(() => prisma.$disconnect())
