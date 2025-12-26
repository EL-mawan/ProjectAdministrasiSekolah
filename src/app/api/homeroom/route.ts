import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')
  const semester = searchParams.get('semester') || 'GANJIL'
  const schoolYear = searchParams.get('schoolYear')

  if (!classId) {
    return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
  }

  try {
    const students = await db.student.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
      include: {
        homeroomNotes: {
          where: {
            semester,
            ...(schoolYear && { schoolYear })
          }
        }
      }
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching homeroom students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { classId, semester, schoolYear, data } = body

    // Validate class and get teacher
    const classInfo = await db.class.findUnique({
        where: { id: classId },
        select: { homeroomId: true }
    })

    if (!classInfo || !classInfo.homeroomId) {
        return NextResponse.json({ error: 'Class or Homeroom Teacher not found' }, { status: 404 })
    }

    const teacherId = classInfo.homeroomId

    // Transaction to update all notes
    await db.$transaction(
        data.map((item: any) => 
            db.homeroomNote.upsert({
                where: {
                    studentId_semester_schoolYear: {
                        studentId: item.studentId,
                        semester,
                        schoolYear
                    }
                },
                update: {
                    notes: item.notes,
                    attendance_s: parseInt(item.s) || 0,
                    attendance_i: parseInt(item.i) || 0,
                    attendance_a: parseInt(item.a) || 0,
                    teacherId // Update teacher if changed?
                },
                create: {
                    studentId: item.studentId,
                    classId,
                    teacherId,
                    semester,
                    schoolYear,
                    notes: item.notes || '',
                    attendance_s: parseInt(item.s) || 0,
                    attendance_i: parseInt(item.i) || 0,
                    attendance_a: parseInt(item.a) || 0
                }
            })
        )
    )

    return NextResponse.json({ message: 'Data saved successfully' })
  } catch (error) {
    console.error('Error saving homeroom notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
