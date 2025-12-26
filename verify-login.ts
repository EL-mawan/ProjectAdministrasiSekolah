import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyLogin() {
  console.log('🔍 Verifying admin login...')
  
  const email = 'admin@sman1jkt.sch.id'
  const password = 'admin123'

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('❌ User not found!')
    return
  }

  console.log('✅ User found:', user.email)
  console.log('🔑 Stored Hash:', user.password)

  const isValid = await bcrypt.compare(password, user.password)
  console.log('🔐 Password Check:', isValid ? 'VALID' : 'INVALID')

  if (!isValid) {
    console.log('⚠️  Password mismatch. Updating password...')
    const newHash = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: { password: newHash }
    })
    console.log('✅ Password updated manually.')
  }
}

verifyLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
