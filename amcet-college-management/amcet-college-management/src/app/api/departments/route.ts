import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            students: true,
            faculties: true,
            subjects: true,
          },
        },
        faculties: {
          where: { isHOD: true },
          include: { user: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ departments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, code } = await request.json();
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
    }

    const formattedCode = code.toUpperCase().trim();
    const existing = await prisma.department.findFirst({
      where: {
        OR: [
          { code: formattedCode },
          { name: { equals: name, mode: 'insensitive' } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Department code or name already exists' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: formattedCode,
      },
    });

    return NextResponse.json({ message: 'Department created successfully', department }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
