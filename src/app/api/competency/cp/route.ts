import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const phase = searchParams.get('phase')
    
    const where: any = {}
    if (subjectId) where.subjectId = subjectId
    if (phase) where.phase = phase

    const cps = await db.capaianPembelajaran.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        _count: { select: { tps: true } }
      }
    })

    return NextResponse.json({ cps })
  } catch (error) {
    console.error('CP GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch CPs', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { subjectId, code, element, description, phase } = data

    const cp = await db.capaianPembelajaran.create({
      data: {
        subjectId,
        code,
        element,
        description,
        phase
      }
    })

    return NextResponse.json({ message: 'CP successfully created', cp }, { status: 201 })
  } catch (error) {
    console.error('CP POST Error:', error)
    return NextResponse.json({ error: 'Failed to create CP', details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
      const data = await request.json()
      const { id, code, element, description, phase } = data

      if(!id) return NextResponse.json({error: 'ID required'}, {status: 400})

      const cp = await db.capaianPembelajaran.update({
          where: { id },
          data: {
              code,
              element,
              description,
              phase
          }
      })

      return NextResponse.json({ message: 'CP updated', cp })
  } catch (error) {
      console.error('CP PUT Error:', error)
      return NextResponse.json({ error: 'Failed to update CP', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        await db.capaianPembelajaran.delete({ where: { id } })
        return NextResponse.json({ message: 'CP deleted' })
    } catch(e) { 
        console.error('CP DELETE Error:', e)
        return NextResponse.json({error: 'Failed', details: String(e)}, {status:500}) 
    }
}
