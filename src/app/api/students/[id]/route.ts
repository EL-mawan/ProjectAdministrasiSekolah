import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: params.id },
      include: {
        class: {
          include: {
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true
              }
            }
          }
        },
        grades: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        attendance: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        },
        violations: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        },
        achievements: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ student })

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const existingStudent = await db.student.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { nis: data.nis },
              ...(data.nisn ? [{ nisn: data.nisn }] : [])
            ]
          }
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIS atau NISN sudah digunakan oleh siswa lain' },
        { status: 400 }
      )
    }

    const student = await db.student.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        ...(data.enrollmentDate && { enrollmentDate: new Date(data.enrollmentDate) }),
        ...(data.graduationDate && { graduationDate: new Date(data.graduationDate) }),
        ...(data.childNumber && { childNumber: parseInt(data.childNumber) })
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
      message: 'Data siswa berhasil diperbarui',
      student
    })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: params.id }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.student.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Data siswa berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}