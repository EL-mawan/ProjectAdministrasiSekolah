import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const document = await db.document.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.sender !== undefined && { sender: data.sender }),
        ...(data.recipient !== undefined && { recipient: data.recipient })
      }
    })
    return NextResponse.json({ message: 'Dokumen berhasil diperbarui', document })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.document.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Dokumen berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
