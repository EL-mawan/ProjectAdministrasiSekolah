
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany()
  const nisMap = new Map()
  const nisnMap = new Map()

  for (const student of students) {
    if (nisMap.has(student.nis)) {
      const newNis = `${student.nis}_${Math.random().toString(36).substring(2, 5)}`
      console.log(`Fixing duplicate NIS: ${student.nis} -> ${newNis} for student ${student.name}`)
      await prisma.student.update({
        where: { id: student.id },
        data: { nis: newNis }
      })
    } else {
      nisMap.set(student.nis, student.id)
    }

    if (student.nisn) {
      if (nisnMap.has(student.nisn)) {
        const newNisn = `${student.nisn}${Math.floor(Math.random() * 9)}`
        console.log(`Fixing duplicate NISN: ${student.nisn} -> ${newNisn} for student ${student.name}`)
        await prisma.student.update({
          where: { id: student.id },
          data: { nisn: newNisn }
        })
      } else {
        nisnMap.set(student.nisn, student.id)
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
