import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    
    const where: any = {}
    if (date) where.date = { gte: new Date(date), lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) }
    if (studentId) where.studentId = studentId
    if (teacherId) where.teacherId = teacherId

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nis: true } },
        teacher: { select: { id: true, name: true } },
        staff: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' },
      take: 100
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, studentId, teacherId, staffId, date, status, notes } = data

    if (!userId || !status || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Determine unique filter and data for upsert
    let where: any = {}
    if (studentId) where = { studentId_date: { studentId, date: new Date(date) } }
    else if (teacherId) where = { teacherId_date: { teacherId, date: new Date(date) } }
    else if (staffId) where = { staffId_date: { staffId, date: new Date(date) } }
    else where = { userId_date: { userId, date: new Date(date) } }

    const attendance = await db.attendance.upsert({
      where,
      update: {
        status,
        notes: notes || null,
        userId // Update who recorded it
      },
      create: {
        userId,
        studentId: studentId || null,
        teacherId: teacherId || null,
        staffId: staffId || null,
        date: new Date(date),
        status,
        notes: notes || null
      }
    })

    return NextResponse.json({ message: 'Absensi berhasil disimpan', attendance }, { status: 201 })
  } catch (error: any) {
    console.error('Attendance Error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan absensi' }, { status: 500 })
  }
}
