import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const advisors = await prisma.classAdvisor.findMany({
      include: {
        faculty: { include: { user: true } },
        department: true,
      },
      orderBy: [{ department: { code: 'asc' } }, { year: 'asc' }, { section: 'asc' }],
    });

    return NextResponse.json({ advisors });
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

    const { departmentId, year, section, facultyId } = await request.json();
    if (!departmentId || !year || !section || !facultyId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const parsedYear = parseInt(year);
    const upperSection = section.toUpperCase().trim();

    // Check if class already has an advisor
    const existing = await prisma.classAdvisor.findUnique({
      where: {
        departmentId_year_section: {
          departmentId,
          year: parsedYear,
          section: upperSection,
        },
      },
    });

    let advisor;
    if (existing) {
      // Reassign to new faculty
      advisor = await prisma.classAdvisor.update({
        where: { id: existing.id },
        data: { facultyId },
        include: { faculty: { include: { user: true } }, department: true },
      });
    } else {
      advisor = await prisma.classAdvisor.create({
        data: {
          departmentId,
          year: parsedYear,
          section: upperSection,
          facultyId,
        },
        include: { faculty: { include: { user: true } }, department: true },
      });
    }

    return NextResponse.json({ message: 'Class advisor assigned successfully', advisor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
