import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const facility = await db.facility.findUnique({
      where: { id: params.id },
      include: { school: true, borrowings: true }
    })
    if (!facility) return NextResponse.json({ error: 'Fasilitas tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ facility })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const facility = await db.facility.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.condition && { condition: data.condition }),
        ...(data.status && { status: data.status }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.quantity && { quantity: data.quantity }),
        ...(data.description !== undefined && { description: data.description })
      }
    })
    return NextResponse.json({ message: 'Fasilitas berhasil diperbarui', facility })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.facility.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Fasilitas berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
