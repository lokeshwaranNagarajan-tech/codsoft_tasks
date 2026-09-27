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
    const { name, dob, registerNo, departmentId, year, semester, section } = body;

    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          name: name ?? existingStudent.user.name,
          dob: dob ? new Date(dob) : existingStudent.user.dob,
        },
      });

      return tx.student.update({
        where: { id },
        data: {
          registerNo: registerNo ?? existingStudent.registerNo,
          departmentId: departmentId ?? existingStudent.departmentId,
          year: year ? parseInt(year) : existingStudent.year,
          semester: semester ? parseInt(semester) : existingStudent.semester,
          section: section ? section.toUpperCase() : existingStudent.section,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return NextResponse.json({ message: 'Student updated successfully', student: updated });
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
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Deleting User cascades to Student
    await prisma.user.delete({ where: { id: student.userId } });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
