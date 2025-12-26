import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const phase = searchParams.get('phase') // Optional: filter targets by project's phase if needed directly, though usually via project

    const where: any = {}

    if (projectId) {
      where.projectId = projectId
    }
    
    // If we want to filter targets by phase, we might need to join with Project table or filter after fetch if specific phase on target isn't stored (Target is child of Project which has Phase)
    // The schema has P5Target linked to P5Project. P5Project has 'phase'. 
    // If we want to get all targets for 'Fase E', we need to look up projects with Phase E.
    if (phase) {
        where.project = {
            phase: phase
        }
    }

    const targets = await db.p5Target.findMany({
      where,
      include: {
        project: {
            select: { title: true, phase: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ targets })
  } catch (error) {
    console.error('Error fetching P5 Targets:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const newTarget = await db.p5Target.create({
      data: {
        projectId: data.projectId,
        dimension: data.dimension,
        element: data.element,
        subElement: data.subElement,
        target: data.target
      }
    })

    return NextResponse.json({ message: 'Target capaian berhasil ditambahkan', target: newTarget }, { status: 201 })
  } catch (error) {
    console.error('Error creating P5 Target:', error)
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

    const updatedTarget = await db.p5Target.update({
      where: { id },
      data: {
        dimension: updateData.dimension,
        element: updateData.element,
        subElement: updateData.subElement,
        target: updateData.target,
        // projectId usually doesn't change, but can be added if needed
      }
    })

    return NextResponse.json({ message: 'Target berhasil diperbarui', target: updatedTarget })
  } catch (error) {
    console.error('Error updating P5 Target:', error)
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

    await db.p5Target.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting P5 Target:', error)
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}
