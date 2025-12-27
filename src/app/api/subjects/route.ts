import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const teacherId = searchParams.get('teacherId')
    
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } }
      ]
    }

    if (teacherId) {
      where.teachers = { some: { id: teacherId } }
    }

    const subjectsRaw = await db.subject.findMany({
      where,
      include: {
        teachers: { select: { id: true, name: true }, take: 1 },
        _count: { select: { schedules: true, grades: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Map to singular teacher for frontend compatibility
    const subjects = subjectsRaw.map(s => ({
      ...s,
      teacher: s.teachers[0] || null
    }))

    return NextResponse.json({ subjects })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const subject = await db.subject.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        credits: data.credits || 1,
        curriculum: data.curriculum,
        schoolId: data.schoolId,
        ...(data.teacherId && {
          teachers: {
            connect: { id: data.teacherId }
          }
        })
      }
    })
    return NextResponse.json({ message: 'Mata pelajaran berhasil ditambahkan', subject }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
