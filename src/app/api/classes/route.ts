import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolYear = searchParams.get('schoolYear')
    const search = searchParams.get('search') || ''
    const homeroomEmail = searchParams.get('homeroomEmail')
    
    const where: any = {}
    if (schoolYear) {
      where.schoolYear = schoolYear
    }

    if (homeroomEmail) {
        where.homeroom = {
            email: homeroomEmail
        }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { schoolYear: { contains: search } }
      ]
    }

    const classes = await db.class.findMany({
      where,
      include: {
        homeroom: {
          select: { id: true, name: true }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: [
        { schoolYear: 'desc' },
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const classData = await db.class.create({
      data: {
        name: data.name,
        level: data.level,
        grade: data.grade,
        schoolYear: data.schoolYear,
        schoolId: data.schoolId,
        capacity: data.capacity || 36,
        description: data.description || null,
        homeroomId: data.homeroomId || null
      }
    })

    return NextResponse.json({ message: 'Kelas berhasil ditambahkan', class: classData }, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
