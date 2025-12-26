import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const phase = searchParams.get('phase')

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    if (phase) {
      where.phase = phase
    }

    const projects = await db.p5Project.findMany({
      where,
      include: {
        _count: {
          select: { members: true, targets: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching P5 Projects:', error)
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

    const newProject = await db.p5Project.create({
      data: {
        title: data.title,
        description: data.description,
        phase: data.phase, // Ensure this matches enum P5Phase
        schoolId: school.id,
        schoolYear: school.activeSchoolYear || '2024/2025', // Fallback if not set
        coordinatorId: data.coordinatorId || null
      }
    })

    return NextResponse.json({ message: 'Projek berhasil ditambahkan', project: newProject }, { status: 201 })
  } catch (error) {
    console.error('Error creating P5 Project:', error)
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

    const updatedProject = await db.p5Project.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        phase: updateData.phase,
        coordinatorId: updateData.coordinatorId || null
      }
    })

    return NextResponse.json({ message: 'Data berhasil diperbarui', project: updatedProject })
  } catch (error) {
    console.error('Error updating P5 Project:', error)
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

    await db.p5Project.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting P5 Project:', error)
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}
