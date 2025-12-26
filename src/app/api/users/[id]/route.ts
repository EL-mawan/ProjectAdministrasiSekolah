import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        teacherProfile: true,
        staffProfile: true
      }
    })
    
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // First, get or create teacher profile if needed
    let teacherProfileId: string | null = null
    
    if (data.role === 'TEACHER' || data.role === 'HOMEROOM') {
      const school = await db.school.findFirst()
      if (!school) {
        return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 400 })
      }

      const existingUser = await db.user.findUnique({
        where: { id: params.id },
        include: { teacherProfile: true }
      })

      if (existingUser?.teacherProfile) {
        // Update existing teacher profile
        await db.teacher.update({
          where: { id: existingUser.teacherProfile.id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email })
          }
        })
        teacherProfileId = existingUser.teacherProfile.id
      } else {
        // Create new teacher profile
        const newTeacher = await db.teacher.create({
          data: {
            userId: params.id,
            name: data.name || '',
            email: data.email || '',
            gender: 'MALE',
            birthDate: new Date(),
            birthPlace: '-',
            address: '-',
            hireDate: new Date(),
            schoolId: school.id
          }
        })
        teacherProfileId = newTeacher.id
      }

      // Update Subject if role is TEACHER (many-to-many relationship)
      if (data.role === 'TEACHER' && data.subjectId && teacherProfileId) {
        // First, disconnect this teacher from any other subjects (one teacher = one subject)
        await db.teacher.update({
          where: { id: teacherProfileId },
          data: {
            subjects: { set: [] }  // Clear all existing subjects
          }
        })
        
        // Then connect to the selected subject
        await db.teacher.update({
          where: { id: teacherProfileId },
          data: {
            subjects: { connect: { id: data.subjectId } }
          }
        })
      }

      // Update Class homeroomId if role is HOMEROOM
      if (data.role === 'HOMEROOM' && data.classId) {
        // First, remove this teacher from any other classes
        await db.class.updateMany({
          where: { homeroomId: teacherProfileId },
          data: { homeroomId: null }
        })
        
        // Then assign to the selected class
        await db.class.update({
          where: { id: data.classId },
          data: { homeroomId: teacherProfileId }
        })
      }
    }

    // Now update the user
    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        teacherProfile: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json({ message: 'User berhasil diperbarui', user })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.user.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
