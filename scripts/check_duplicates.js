
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const allStudents = await prisma.student.findMany()
  console.log(`Total students: ${allStudents.length}`)
  
  const nisCounts = {}
  allStudents.forEach(s => {
    nisCounts[s.nis] = (nisCounts[s.nis] || 0) + 1
  })
  
  const duplicates = Object.keys(nisCounts).filter(nis => nisCounts[nis] > 1)
  if (duplicates.length > 0) {
    console.log('Found duplicate NIS:', duplicates)
  } else {
    console.log('No duplicate NIS found.')
  }
}

main().finally(() => prisma.$disconnect())
