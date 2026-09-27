import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  facultyId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'LEAVE']),
});

// GET: list attendance records with filters & pagination
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowedRoles = ['PRIMARY_ADMIN', 'SECONDARY_ADMIN', 'FACULTY', 'STUDENT'];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const studentId = searchParams.get('studentId');
  const subjectId = searchParams.get('subjectId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (subjectId) where.subjectId = subjectId;
  if (dateFrom && dateTo) {
    where.date = { gte: new Date(dateFrom), lte: new Date(dateTo) };
  }

  // Students can only see their own attendance
  if (session.role === 'STUDENT' && session.studentId) {
    where.studentId = session.studentId;
  }

  const total = await prisma.attendance.count({ where });
  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: { include: { user: true, department: true } },
      subject: true,
      faculty: { include: { user: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { date: 'desc' },
  });

  return NextResponse.json({
    records,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// POST: create a new attendance record (admin/faculty)
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !['PRIMARY_ADMIN', 'SECONDARY_ADMIN', 'FACULTY'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = attendanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { studentId, subjectId, facultyId, date, status } = parsed.data;

  const record = await prisma.attendance.create({
    data: {
      studentId,
      subjectId,
      facultyId: facultyId ?? null,
      date: new Date(date),
      status,
    },
    include: { student: true, subject: true, faculty: true },
  });

  return NextResponse.json({ message: 'Attendance recorded', record }, { status: 201 });
}
