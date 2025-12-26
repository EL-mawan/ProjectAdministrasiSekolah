import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const extraId = searchParams.get('extraId')

    if (!extraId) {
      return NextResponse.json({ error: 'Extracurricular ID required' }, { status: 400 })
    }

    const members = await db.extraMember.findMany({
      where: { extracurricularId: extraId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nisn: true,
            class: {
                select: { name: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { extraId, studentId } = await request.json()

    if (!extraId || !studentId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Check if already exists
    const exists = await db.extraMember.findUnique({
      where: {
        extracurricularId_studentId: {
          extracurricularId: extraId,
          studentId
        }
      }
    })

    if (exists) {
      return NextResponse.json({ error: 'Siswa sudah terdaftar di ekskul ini' }, { status: 400 })
    }

    const member = await db.extraMember.create({
      data: {
        extracurricularId: extraId,
        studentId
      },
      include: {
        student: {
            select: { name: true }
        }
      }
    })

    return NextResponse.json({ message: 'Anggota berhasil ditambahkan', member }, { status: 201 })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Gagal menambahkan anggota' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    await db.extraMember.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Anggota berhasil dihapus' })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Gagal menghapus anggota' }, { status: 500 })
  }
}
