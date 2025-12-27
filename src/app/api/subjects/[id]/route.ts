import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subjectRaw = await db.subject.findUnique({
      where: { id: params.id },
      include: { 
        teachers: true, 
        school: true, 
        schedules: true, 
        grades: true 
      }
    })
    
    if (!subjectRaw) return NextResponse.json({ error: 'Mata pelajaran tidak ditemukan' }, { status: 404 })

    const subject = {
      ...subjectRaw,
      teacher: subjectRaw.teachers[0] || null
    }

    return NextResponse.json({ subject })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const subject = await db.subject.update({
      where: { id: params.id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.credits && { credits: data.credits }),
        ...(data.curriculum && { curriculum: data.curriculum }),
        ...(data.teacherId !== undefined && { 
          teachers: {
            set: data.teacherId ? [{ id: data.teacherId }] : []
          } 
        })
      }
    })
    return NextResponse.json({ message: 'Mata pelajaran berhasil diperbarui', subject })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.subject.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Mata pelajaran berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
