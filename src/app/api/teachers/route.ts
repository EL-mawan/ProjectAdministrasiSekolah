import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all teachers with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nip: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (status) {
      where.status = status
    }

    const [teachers, total] = await Promise.all([
      db.teacher.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true
            }
          },
          school: {
            select: {
              id: true,
              name: true
            }
          },
          subjects: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.teacher.count({ where })
    ])

    return NextResponse.json({
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Create new teacher
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const requiredFields = ['name', 'gender', 'birthDate', 'birthPlace', 'address', 'hireDate', 'schoolId', 'email', 'password']
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field wajib: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Check if NIP already exists
    if (data.nip) {
      const existingTeacher = await db.teacher.findUnique({
        where: { nip: data.nip }
      })

      if (existingTeacher) {
        return NextResponse.json(
          { error: 'NIP sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Create user first
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true
      }
    })

    // Create teacher
    const teacher = await db.teacher.create({
      data: {
        userId: user.id,
        nip: data.nip || null,
        nuptk: data.nuptk || null,
        name: data.name,
        gender: data.gender,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        religion: data.religion || null,
        address: data.address,
        phone: data.phone || null,
        email: data.email,
        education: data.education || null,
        major: data.major || null,
        hireDate: new Date(data.hireDate),
        status: data.status || 'ACTIVE',
        position: data.position || null,
        rank: data.rank || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        schoolId: data.schoolId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Data guru berhasil ditambahkan',
      teacher
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
