import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    
    const where: any = {}
    if (role) where.role = role
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        teacherProfile: { 
          select: { 
            id: true, 
            nip: true, 
            position: true,
            subjects: { select: { id: true, name: true } },
            classes: { select: { id: true, name: true } }
          } 
        },
        staffProfile: { select: { id: true, nip: true, department: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`[DEBUG] /api/users found ${users.length} users with where:`, JSON.stringify(where))

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        isActive: data.isActive !== false,
        ...( (data.role === 'TEACHER' || data.role === 'HOMEROOM') && {
          teacherProfile: {
            create: {
              name: data.name,
              email: data.email,
              gender: 'MALE', // Default
              birthDate: new Date(),
              birthPlace: '-',
              address: '-',
              hireDate: new Date(),
              schoolId: (await db.school.findFirst())?.id || '',
              subjects: data.subjectId ? { connect: { id: data.subjectId } } : undefined,
              classes: data.classId ? { connect: { id: data.classId } } : undefined
            }
          }
        })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    // If role is HOMEROOM, also update the Class to set this teacher as homeroomId
    if (data.role === 'HOMEROOM' && data.classId) {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) {
        await db.class.update({
          where: { id: data.classId },
          data: { homeroomId: teacher.id }
        })
      }
    }

    // If role is TEACHER, also update the Subject to set this teacher as teacherId
    if (data.role === 'TEACHER' && data.subjectId) {
      const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) {
        await db.subject.update({
          where: { id: data.subjectId },
          data: { teacherId: teacher.id }
        })
      }
    }

    return NextResponse.json({ message: 'User berhasil ditambahkan', user }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
