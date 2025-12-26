import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const type = searchParams.get('type')
    
    const where: any = {}
    if (studentId) where.studentId = studentId
    if (type) where.type = type

    const achievements = await db.achievement.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nis: true } }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const achievement = await db.achievement.create({
      data: {
        studentId: data.studentId,
        type: data.type,
        title: data.title,
        description: data.description,
        level: data.level || null,
        date: new Date(data.date),
        certificate: data.certificate || null
      }
    })
    return NextResponse.json({ message: 'Prestasi berhasil ditambahkan', achievement }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
