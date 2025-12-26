import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const school = await db.school.findFirst({
      where: { isActive: true }
    })

    if (!school) {
        // Create a default one if none exists? Or just return 404.
        // For smoother UX, let's create a placeholder if it doesn't exist
        const newSchool = await db.school.create({
            data: {
                name: 'Nama Sekolah',
                address: 'Alamat Sekolah',
                npsn: '00000000'
            }
        })
        return NextResponse.json({ school: newSchool })
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    // Find first active school or create
    const exist = await db.school.findFirst({ where: { isActive: true } })

    let school;
    if (exist) {
        school = await db.school.update({
            where: { id: exist.id },
            data: {
                name: body.name,
                npsn: body.npsn,
                nss: body.nss,
                address: body.address,
                postalCode: body.postalCode,
                email: body.email,
                website: body.website,
                phone: body.phone,
                principalName: body.principalName,
                principalNip: body.principalNip,
                established: body.foundedYear ? parseInt(body.foundedYear) : undefined,
                ...(body.activeSemester !== undefined && { activeSemester: body.activeSemester }),
                ...(body.activeSchoolYear !== undefined && { activeSchoolYear: body.activeSchoolYear }),
                // logoUrl: body.logoUrl // To be implemented with upload
            }
        })
    } else {
        school = await db.school.create({
            data: {
                name: body.name,
                npsn: body.npsn,
                nss: body.nss,
                address: body.address,
                postalCode: body.postalCode,
                email: body.email,
                website: body.website,
                phone: body.phone,
                principalName: body.principalName,
                principalNip: body.principalNip,
                established: body.foundedYear ? parseInt(body.foundedYear) : undefined
            }
        })
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data sekolah' }, { status: 500 })
  }
}
