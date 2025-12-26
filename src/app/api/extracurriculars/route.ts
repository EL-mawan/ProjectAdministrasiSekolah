import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where: any = { isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } }
      ]
    }

    const extras = await db.extracurricular.findMany({
      where,
      include: {
        coach: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ extras })
  } catch (error) {
    console.error('Error fetching extracurriculars:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get active school
    const school = await db.school.findFirst({ where: { isActive: true } })
    if (!school) {
        return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 })
    }

    const newExtra = await db.extracurricular.create({
      data: {
        name: data.name,
        description: data.description,
        schedule: data.schedule,
        location: data.location,
        schoolId: school.id,
        coachId: data.coachId || null
      }
    })

    return NextResponse.json({ message: 'Ekstrakurikuler berhasil ditambahkan', extra: newExtra }, { status: 201 })
  } catch (error) {
    console.error('Error creating extracurricular:', error)
    return NextResponse.json({ error: 'Gagal menambahkan data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
       return NextResponse.json({ error: 'ID data diperlukan' }, { status: 400 })
    }

    const updatedExtra = await db.extracurricular.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        schedule: updateData.schedule,
        location: updateData.location,
        coachId: updateData.coachId || null
      }
    })

    return NextResponse.json({ message: 'Data berhasil diperbarui', extra: updatedExtra })
  } catch (error) {
    console.error('Error updating extracurricular:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID data diperlukan' }, { status: 400 })
    }

    await db.extracurricular.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting extracurricular:', error)
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}
