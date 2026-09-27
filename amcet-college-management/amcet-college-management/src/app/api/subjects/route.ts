import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');

    const where: any = {};
    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId;
    if (semester && semester !== 'ALL') where.semester = parseInt(semester);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        faculties: {
          include: {
            faculty: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });

    return NextResponse.json({ subjects });
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

    const { code, name, credits, semester, departmentId } = await request.json();
    if (!code || !name || !credits || !semester || !departmentId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const formattedCode = code.toUpperCase().trim();
    const existing = await prisma.subject.findUnique({ where: { code: formattedCode } });
    if (existing) {
      return NextResponse.json({ error: 'Subject code already exists' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        code: formattedCode,
        name: name.trim(),
        credits: parseInt(credits),
        semester: parseInt(semester),
        departmentId,
      },
      include: { department: true },
    });

    return NextResponse.json({ message: 'Subject created successfully', subject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
