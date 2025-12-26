import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const severity = searchParams.get('severity')
    
    const where: any = {}
    if (studentId) where.studentId = studentId
    if (severity) where.severity = severity

    const violations = await db.violation.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nis: true } }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ violations })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const violation = await db.violation.create({
      data: {
        studentId: data.studentId,
        type: data.type,
        description: data.description,
        severity: data.severity,
        action: data.action || null,
        date: new Date(data.date),
        reportedBy: data.reportedBy
      }
    })
    return NextResponse.json({ message: 'Pelanggaran berhasil dicatat', violation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
