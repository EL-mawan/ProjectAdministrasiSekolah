import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const grade = await db.grade.update({
      where: { id: params.id },
      data: {
        ...(data.score && { score: parseFloat(data.score) }),
        ...(data.maxScore && { maxScore: parseFloat(data.maxScore) }),
        ...(data.notes !== undefined && { notes: data.notes })
      }
    })
    return NextResponse.json({ message: 'Nilai berhasil diperbarui', grade })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.grade.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Nilai berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
