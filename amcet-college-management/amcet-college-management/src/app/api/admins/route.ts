import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'PRIMARY_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Primary Admin access required.' }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['PRIMARY_ADMIN', 'SECONDARY_ADMIN'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'PRIMARY_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Primary Admin access required.' }, { status: 403 });
    }

    const { collegeId, name, dob } = await request.json();
    if (!collegeId || !name || !dob) {
      return NextResponse.json({ error: 'College ID, Name, and DOB are required' }, { status: 400 });
    }

    const formattedId = collegeId.toUpperCase().trim();
    const existing = await prisma.user.findUnique({ where: { collegeId: formattedId } });
    if (existing) {
      return NextResponse.json({ error: 'College ID already exists' }, { status: 400 });
    }

    const admin = await prisma.user.create({
      data: {
        collegeId: formattedId,
        name: name.trim(),
        dob: new Date(dob),
        role: 'SECONDARY_ADMIN',
      },
    });

    return NextResponse.json({ message: 'Secondary Admin created successfully', admin }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
