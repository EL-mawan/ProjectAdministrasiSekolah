import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const subjectId = searchParams.get('subjectId')
    const semester = searchParams.get('semester')
    const schoolYear = searchParams.get('schoolYear')
    
    const where: any = {}
    if (studentId) where.studentId = studentId
    if (subjectId) where.subjectId = subjectId
    if (semester) where.semester = semester
    if (schoolYear) where.schoolYear = schoolYear

    const grades = await db.grade.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nis: true } },
        subject: { select: { id: true, name: true, code: true } }
      },
      orderBy: [{ schoolYear: 'desc' }, { semester: 'desc' }],
      take: 100
    })

    return NextResponse.json({ grades })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { studentId, subjectId, type, score, maxScore, semester, schoolYear, notes } = data

    const grade = await db.grade.upsert({
      where: {
        studentId_subjectId_type_semester_schoolYear: {
          studentId,
          subjectId,
          type,
          semester,
          schoolYear
        }
      },
      update: {
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        notes: notes || null
      },
      create: {
        studentId,
        subjectId,
        type,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        semester,
        schoolYear,
        notes: notes || null
      }
    })
    return NextResponse.json({ message: 'Nilai berhasil disimpan', grade }, { status: 201 })
  } catch (error) {
    console.error('Grades Error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 })
  }
}
