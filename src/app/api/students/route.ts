import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const classId = searchParams.get('classId')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nis: { contains: search } },
        { nisn: { contains: search } }
      ]
    }

    if (classId) {
      where.classId = classId
    }

    if (status) {
      where.status = status
    }

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              level: true
            }
          }
        },
        orderBy: [
          { class: { name: 'asc' } },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      db.student.count({ where })
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const requiredFields = ['nis', 'name', 'gender', 'birthDate', 'birthPlace', 'address', 'schoolId']
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field wajib: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const existingStudent = await db.student.findFirst({
      where: {
        OR: [
          { nis: data.nis },
          ...(data.nisn ? [{ nisn: data.nisn }] : [])
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIS atau NISN sudah terdaftar' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
        enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : new Date(),
        childNumber: data.childNumber ? parseInt(data.childNumber) : undefined,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            level: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Data siswa berhasil ditambahkan',
      student
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}