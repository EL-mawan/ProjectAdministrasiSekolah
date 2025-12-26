import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')
  let semesterParams = searchParams.get('semester') || 'GANJIL'
  const semester = semesterParams === 'GANJIL' ? '1' : semesterParams === 'GENAP' ? '2' : semesterParams
  const schoolYear = searchParams.get('schoolYear') || '2024/2025'

  if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
  }

  try {
    // 1. Get Class SchoolID first to filter subjects
    const classData = await db.class.findUnique({ where: { id: classId }, select: { schoolId: true } })
    if (!classData) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

    const subjects = await db.subject.findMany({
      orderBy: { name: 'asc' },
      where: { schoolId: classData.schoolId }
    })

    const students = await db.student.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
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
            schoolYear: schoolYear || undefined 
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

    return NextResponse.json({ students, subjects })
  } catch (error) {
    console.error('Bulk report data fetch error:', error)
    return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: String(error) 
    }, { status: 500 })
  }
}
