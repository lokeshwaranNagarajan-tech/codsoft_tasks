import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const hods = await prisma.faculty.findMany({
      where: { isHOD: true },
      include: {
        user: true,
        department: true,
      },
    });

    return NextResponse.json({ hods });
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

    const { departmentId, facultyId } = await request.json();
    if (!departmentId || !facultyId) {
      return NextResponse.json({ error: 'Department and Faculty are required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Clear previous HOD for department
      await tx.faculty.updateMany({
        where: { departmentId, isHOD: true },
        data: { isHOD: false },
      });

      // Set new HOD
      await tx.faculty.update({
        where: { id: facultyId },
        data: { isHOD: true, departmentId },
      });
    });

    return NextResponse.json({ message: 'HOD assigned successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
