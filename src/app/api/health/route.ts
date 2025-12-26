import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userCount = await db.user.count()
    const subjectCount = await db.subject.count()
    const dbUrl = process.env.DATABASE_URL ? "Configured" : "MISSING"
    
    return NextResponse.json({ 
      status: 'ok',
      database: {
        connected: true,
        userCount,
        subjectCount,
        urlStatus: dbUrl
      },
      env: {
        vercel: !!process.env.VERCEL,
        node_env: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      message: error.message,
      database_url_present: !!process.env.DATABASE_URL
    }, { status: 500 })
  }
}
