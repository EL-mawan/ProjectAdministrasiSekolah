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
      where.teacherId = teacherId
    }

    const subjects = await db.subject.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { schedules: true, grades: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

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
        teacherId: data.teacherId || null
      }
    })
    return NextResponse.json({ message: 'Mata pelajaran berhasil ditambahkan', subject }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
