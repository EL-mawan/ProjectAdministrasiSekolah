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
    // Fetch class info
    const classInfo = await db.class.findUnique({
      where: { id: classId },
      include: {
        school: true,
      }
    })

    if (!classInfo) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Fetch students of the class
    const students = await db.student.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
    })

    // Fetch all subjects in the school
    const subjects = await db.subject.findMany({
      where: { schoolId: classInfo.schoolId },
      orderBy: { code: 'asc' },
    })

    // Fetch all grades for these students
    const grades = await db.grade.findMany({
      where: {
        studentId: { in: students.map(s => s.id) },
        semester,
        schoolYear: schoolYear || classInfo.schoolYear,
      }
    })

    // Group grades by student
    const legerData = students.map(student => {
      const studentGrades = subjects.map(subject => {
        const subjectGrades = grades.filter(g => g.studentId === student.id && g.subjectId === subject.id)
        
        // Strategy: take FINAL if exists, otherwise average of all types
        const finalGrade = subjectGrades.find(g => g.type === 'FINAL')
        const score = finalGrade ? finalGrade.score : (
          subjectGrades.length > 0 
            ? subjectGrades.reduce((acc, curr) => acc + curr.score, 0) / subjectGrades.length 
            : null
        )

        return {
          subjectId: subject.id,
          subjectCode: subject.code,
          subjectName: subject.name,
          score: score ? parseFloat(score.toFixed(1)) : null
        }
      })

      const totalScore = studentGrades.reduce((acc, curr) => acc + (curr.score || 0), 0)
      const count = studentGrades.filter(g => g.score !== null).length
      const average = count > 0 ? parseFloat((totalScore / count).toFixed(1)) : 0

      return {
        id: student.id,
        nis: student.nis,
        name: student.name,
        gender: student.gender === 'MALE' ? 'L' : 'P',
        grades: studentGrades,
        totalScore,
        average
      }
    })

    // Add Ranking
    const sortedByAverage = [...legerData].sort((a, b) => b.average - a.average)
    const dataWithRanking = legerData.map(student => ({
      ...student,
      ranking: sortedByAverage.findIndex(s => s.id === student.id) + 1
    }))

    return NextResponse.json({
      school: classInfo.school?.name || 'Sekolah',
      className: classInfo.name,
      semester,
      schoolYear: schoolYear || classInfo.schoolYear,
      subjects: subjects.map(s => ({ id: s.id, code: s.code, name: s.name })),
      students: dataWithRanking
    })
  } catch (error) {
    console.error('Leger error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
