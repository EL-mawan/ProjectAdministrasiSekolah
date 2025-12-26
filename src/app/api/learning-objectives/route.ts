import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const subjectId = searchParams.get('subjectId')
    const grade = searchParams.get('grade')
    
    // optional filters
    const where: any = {}
    if (teacherId) where.teacherId = teacherId
    if (subjectId) where.subjectId = subjectId
    if (grade) where.grade = grade

    const learningObjectives = await db.learningObjective.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true } },
        cp: true
      },
      orderBy: { code: 'asc' }
    })

    return NextResponse.json({ learningObjectives })
  } catch (error) {
    console.error('TP API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch TPs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { code, description, subjectId, teacherId, grade, semester, schoolYear, atp } = data

    const tp = await db.learningObjective.create({
      data: {
        code,
        description,
        subjectId,
        teacherId,
        grade,
        semester,
        schoolYear,
        atp
      }
    })

    return NextResponse.json({ message: 'TP successfully created', tp }, { status: 201 })
  } catch (error) {
    console.error('TP API Error:', error)
    return NextResponse.json({ error: 'Failed to create TP' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
      const data = await request.json()
      const { id, code, description, grade, semester, schoolYear, atp } = data

      if(!id) return NextResponse.json({error: 'ID required'}, {status: 400})

      const tp = await db.learningObjective.update({
          where: { id },
          data: {
              code,
              description,
              grade,
              semester,
              schoolYear,
              atp
          }
      })

      return NextResponse.json({ message: 'TP updated', tp })
  } catch (error) {
      return NextResponse.json({ error: 'Failed to update TP' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await db.learningObjective.delete({ where: { id } })
        
        return NextResponse.json({ message: 'TP deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete TP' }, { status: 500 })
    }
}
