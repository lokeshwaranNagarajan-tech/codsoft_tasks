import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const assignments = await prisma.subjectAssignment.findMany({
      include: {
        faculty: { include: { user: true, department: true } },
        subject: { include: { department: true } },
      },
      orderBy: { academicYear: 'desc' },
    });

    return NextResponse.json({ assignments });
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

    const { facultyId, subjectId, academicYear } = await request.json();
    if (!facultyId || !subjectId || !academicYear) {
      return NextResponse.json({ error: 'Faculty, Subject, and Academic Year are required' }, { status: 400 });
    }

    const existing = await prisma.subjectAssignment.findFirst({
      where: { facultyId, subjectId, academicYear },
    });

    if (existing) {
      return NextResponse.json({ error: 'Subject already assigned to this faculty for the specified academic year' }, { status: 400 });
    }

    const assignment = await prisma.subjectAssignment.create({
      data: { facultyId, subjectId, academicYear },
      include: {
        faculty: { include: { user: true } },
        subject: true,
      },
    });

    return NextResponse.json({ message: 'Subject assigned successfully', assignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
