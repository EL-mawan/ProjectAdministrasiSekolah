import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const facilities = await db.facility.findMany({
      where,
      include: {
        school: { select: { id: true, name: true } },
        _count: { select: { borrowings: true } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ facilities })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const facility = await db.facility.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        description: data.description || null,
        condition: data.condition || 'GOOD',
        location: data.location || null,
        quantity: data.quantity || 1,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
        status: data.status || 'AVAILABLE',
        schoolId: data.schoolId
      }
    })
    return NextResponse.json({ message: 'Fasilitas berhasil ditambahkan', facility }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
