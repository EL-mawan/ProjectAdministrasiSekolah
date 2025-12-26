import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classData = await db.class.findUnique({
      where: { id: params.id },
      include: {
        homeroom: true,
        students: true,
        schedules: { include: { subject: true, teacher: true } }
      }
    })
    
    if (!classData) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }
    
    return NextResponse.json({ class: classData })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const classData = await db.class.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.level && { level: data.level }),
        ...(data.grade && { grade: data.grade }),
        ...(data.schoolYear && { schoolYear: data.schoolYear }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.homeroomId !== undefined && { homeroomId: data.homeroomId }),
        ...(data.description !== undefined && { description: data.description })
      }
    })
    
    return NextResponse.json({ message: 'Kelas berhasil diperbarui', class: classData })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.class.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Kelas berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
