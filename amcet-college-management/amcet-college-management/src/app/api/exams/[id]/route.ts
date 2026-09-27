import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';

const patchSchema = z.object({
  name: z.string().optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  academicYear: z.string().optional(),
});

// GET: fetch a single exam by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      marks: {
        include: {
          student: { include: { user: true } },
          subject: true,
        },
      },
      _count: { select: { marks: true } },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }

  return NextResponse.json({ exam });
}

// PATCH: update an exam
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
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

  const { name, semester, academicYear } = parsed.data;

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(semester && { semester }),
      ...(academicYear && { academicYear }),
    },
  });

  return NextResponse.json({ message: 'Exam updated successfully', exam });
}

// DELETE: delete an exam (cascades marks)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  await prisma.exam.delete({ where: { id } });

  return NextResponse.json({ message: 'Exam deleted successfully' });
}
