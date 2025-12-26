import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const where: any = {}
    if (type) where.type = type

    const documents = await db.document.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } }
      },
      orderBy: { date: 'desc' },
      take: 100
    })

    return NextResponse.json({ documents })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const document = await db.document.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content || null,
        number: data.number || null,
        date: new Date(data.date),
        sender: data.sender || null,
        recipient: data.recipient || null,
        attachments: data.attachments || null,
        createdBy: data.createdBy
      }
    })
    return NextResponse.json({ message: 'Dokumen berhasil ditambahkan', document }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
