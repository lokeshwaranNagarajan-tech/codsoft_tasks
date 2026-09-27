import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';

const patchSchema = z.object({
  date: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LEAVE']).optional(),
});

// GET: fetch single attendance record by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  // Students can only view their own attendance record
  if (session.role === 'STUDENT' && session.studentId && session.studentId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const record = await prisma.attendance.findUnique({
    where: { id },
    include: {
      student: { include: { user: true, department: true } },
      subject: true,
      faculty: { include: { user: true } },
    },
  });

  if (!record) {
    return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
  }

  return NextResponse.json(record);
}

// PATCH: update attendance status or date
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session || !['PRIMARY_ADMIN', 'SECONDARY_ADMIN', 'FACULTY'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { date, status } = parsed.data;

  const record = await prisma.attendance.update({
    where: { id },
    data: {
      ...(date ? { date: new Date(date) } : {}),
      ...(status ? { status } : {}),
    },
    include: { student: true, subject: true, faculty: true },
  });

  return NextResponse.json({ message: 'Attendance updated successfully', record });
}

// DELETE: remove an attendance record
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session || !['PRIMARY_ADMIN', 'SECONDARY_ADMIN', 'FACULTY'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  await prisma.attendance.delete({ where: { id } });

  return NextResponse.json({ message: 'Attendance record deleted successfully' });
}
