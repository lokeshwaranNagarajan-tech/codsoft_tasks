import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, dob, designation, departmentId, isHOD } = body;

    const existingFaculty = await prisma.faculty.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingFaculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingFaculty.userId },
        data: {
          name: name ?? existingFaculty.user.name,
          dob: dob ? new Date(dob) : existingFaculty.user.dob,
        },
      });

      if (isHOD) {
        const targetDept = departmentId || existingFaculty.departmentId;
        await tx.faculty.updateMany({
          where: { departmentId: targetDept, isHOD: true },
          data: { isHOD: false },
        });
      }

      return tx.faculty.update({
        where: { id },
        data: {
          designation: designation ?? existingFaculty.designation,
          departmentId: departmentId ?? existingFaculty.departmentId,
          isHOD: isHOD !== undefined ? Boolean(isHOD) : existingFaculty.isHOD,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return NextResponse.json({ message: 'Faculty updated successfully', faculty: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const faculty = await prisma.faculty.findUnique({ where: { id } });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: faculty.userId } });

    return NextResponse.json({ message: 'Faculty deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
