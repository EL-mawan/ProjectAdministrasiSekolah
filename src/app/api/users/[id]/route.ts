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

    const user = await db.user.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...( (data.role === 'TEACHER' || data.role === 'HOMEROOM') && {
          teacherProfile: {
            upsert: {
              create: {
                name: data.name || '',
                email: data.email || '',
                gender: 'MALE',
                birthDate: new Date(),
                birthPlace: '-',
                address: '-',
                hireDate: new Date(),
                schoolId: (await db.school.findFirst())?.id || '',
                subjects: data.subjectId ? { connect: { id: data.subjectId } } : undefined,
                classes: data.classId ? { connect: { id: data.classId } } : undefined
              },
              update: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                subjects: data.subjectId ? { set: [{ id: data.subjectId }] } : undefined,
                classes: data.classId ? { set: [{ id: data.classId }] } : undefined
              }
            }
          }
        })
      },
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

    // Sync Class homeroomId if role is HOMEROOM
    if (data.role === 'HOMEROOM' && data.classId && user.teacherProfile) {
      await db.class.update({
        where: { id: data.classId },
        data: { homeroomId: user.teacherProfile.id }
      })
    }

    // Sync Subject teacherId if role is TEACHER
    if (data.role === 'TEACHER' && data.subjectId && user.teacherProfile) {
      await db.subject.update({
        where: { id: data.subjectId },
        data: { teacherId: user.teacherProfile.id }
      })
    }

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
