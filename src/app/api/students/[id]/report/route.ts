import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const studentId = params.id
  const { searchParams } = new URL(request.url)
  let semesterParams = searchParams.get('semester') || 'GANJIL'
  const semester = semesterParams === 'GANJIL' ? '1' : semesterParams === 'GENAP' ? '2' : semesterParams
  const schoolYear = searchParams.get('schoolYear') || '2024/2025'

  try {
    // Verify student exists first to fail fast
    const basicStudent = await db.student.findUnique({ where: { id: studentId } });
    if (!basicStudent) {
        return NextResponse.json({ error: 'Student not found (ID check)' }, { status: 404 });
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            homeroom: true
          }
        },
        school: true,
        grades: {
          where: {
            semester: semester,
            schoolYear: schoolYear || undefined // Use undefined to skip filter if null
          },
          include: {
            subject: true
          }
        },
        extraMembers: {
          include: {
            extracurricular: true
          }
        },
        homeroomNotes: {
          where: {
            semester: semester,
            schoolYear: schoolYear || undefined
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const subjects = await db.subject.findMany({
      orderBy: { name: 'asc' },
      where: { schoolId: student.schoolId }
    })

    return NextResponse.json({ student, subjects })
  } catch (error) {
    console.error('Report data fetch error:', error)
    return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: String(error) 
    }, { status: 500 })
  }
}
