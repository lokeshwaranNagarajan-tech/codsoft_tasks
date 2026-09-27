import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

const examSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  semester: z.coerce.number().int().min(1).max(8),
  academicYear: z.string().min(1, 'Academic year is required'),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET: list all exams with pagination & filters
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pagination = paginationSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });
  if (!pagination.success) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters', details: pagination.error.flatten() },
      { status: 400 },
    );
  }

  const { page, limit } = pagination.data;
  const semester = searchParams.get('semester');
  const academicYear = searchParams.get('academicYear');
  const search = searchParams.get('search');

  const where: Prisma.ExamWhereInput = {};
  if (semester && semester !== 'ALL') {
    const parsedSemester = z.coerce.number().int().min(1).max(8).safeParse(semester);
    if (!parsedSemester.success) {
      return NextResponse.json({ error: 'Invalid semester' }, { status: 400 });
    }
    where.semester = parsedSemester.data;
  }
  if (academicYear && academicYear !== 'ALL') where.academicYear = academicYear;
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const total = await prisma.exam.count({ where });
  const exams = await prisma.exam.findMany({
    where,
    include: {
      _count: { select: { marks: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    exams,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// POST: create a new exam
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = examSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, semester, academicYear } = parsed.data;

  const exam = await prisma.exam.create({
    data: { name, semester, academicYear },
  });

  return NextResponse.json({ message: 'Exam created successfully', exam }, { status: 201 });
}
