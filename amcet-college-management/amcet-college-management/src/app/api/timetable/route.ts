import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');
    const section = searchParams.get('section');
    const facultyId = searchParams.get('facultyId');

    const where: any = {};
    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId;
    if (semester && semester !== 'ALL') where.semester = parseInt(semester);
    if (section && section !== 'ALL') where.section = section.toUpperCase();
    if (facultyId) where.facultyId = facultyId;

    const slots = await prisma.timetable.findMany({
      where,
      include: {
        department: true,
        subject: true,
        faculty: { include: { user: true } },
      },
      orderBy: [{ period: 'asc' }],
    });

    return NextResponse.json({ slots });
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

    const { departmentId, semester, section, day, period, subjectId, facultyId } = await request.json();
    if (!departmentId || !semester || !section || !day || !period || !subjectId || !facultyId) {
      return NextResponse.json({ error: 'All timetable fields are required' }, { status: 400 });
    }

    const parsedSem = parseInt(semester);
    const parsedPeriod = parseInt(period);
    const upperSec = section.toUpperCase().trim();
    const upperDay = day.toUpperCase().trim();

    const slot = await prisma.timetable.upsert({
      where: {
        departmentId_semester_section_day_period: {
          departmentId,
          semester: parsedSem,
          section: upperSec,
          day: upperDay,
          period: parsedPeriod,
        },
      },
      update: {
        subjectId,
        facultyId,
      },
      create: {
        departmentId,
        semester: parsedSem,
        section: upperSec,
        day: upperDay,
        period: parsedPeriod,
        subjectId,
        facultyId,
      },
      include: {
        department: true,
        subject: true,
        faculty: { include: { user: true } },
      },
    });

    return NextResponse.json({ message: 'Timetable slot updated successfully', slot });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
