import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get single teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    const teacher = await db.teacher.findUnique({
      where: { id: p.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        school: true,
        subjects: true,
        classes: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Data guru tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ teacher })

  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT - Update teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    const data = await request.json()

    const teacher = await db.teacher.update({
      where: { id: p.id },
      data: {
        ...(data.nip && { nip: data.nip }),
        ...(data.nuptk && { nuptk: data.nuptk }),
        ...(data.name && { name: data.name }),
        ...(data.gender && { gender: data.gender }),
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        ...(data.birthPlace && { birthPlace: data.birthPlace }),
        ...(data.religion && { religion: data.religion }),
        ...(data.address && { address: data.address }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(data.education && { education: data.education }),
        ...(data.major && { major: data.major }),
        ...(data.hireDate && { hireDate: new Date(data.hireDate) }),
        ...(data.status && { status: data.status }),
        ...(data.position && { position: data.position }),
        ...(data.rank && { rank: data.rank }),
        ...(data.salary && { salary: parseFloat(data.salary) })
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
      message: 'Data guru berhasil diperbarui',
      teacher
    })

  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE - Delete teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params
    const teacher = await db.teacher.findUnique({
      where: { id: p.id },
      select: { userId: true }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Data guru tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete teacher first
    await db.teacher.delete({
      where: { id: p.id }
    })

    // Then delete user
    await db.user.delete({
      where: { id: teacher.userId }
    })

    return NextResponse.json({
      message: 'Data guru berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
