import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { z } from 'zod';

const createStudentSchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
  registerNo: z.string().min(1, 'Register Number is required'),
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  departmentId: z.string().min(1, 'Department is required'),
  year: z.coerce.number().min(1).max(4),
  semester: z.coerce.number().min(1).max(8),
  section: z.string().min(1, 'Section is required'),
});

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN' && session.role !== 'FACULTY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const year = searchParams.get('year');
    const section = searchParams.get('section');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    }
    if (year && year !== 'ALL') {
      where.year = parseInt(year);
    }
    if (section && section !== 'ALL') {
      where.section = section.toUpperCase();
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { collegeId: { contains: search, mode: 'insensitive' } } },
        { registerNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.student.count({ where });
    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { collegeId, registerNo, name, dob, departmentId, year, semester, section } = parsed.data;

    // Check existing
    const existingCollege = await prisma.user.findUnique({ where: { collegeId } });
    if (existingCollege) {
      return NextResponse.json({ error: 'College ID already exists' }, { status: 400 });
    }

    const existingReg = await prisma.student.findUnique({ where: { registerNo } });
    if (existingReg) {
      return NextResponse.json({ error: 'Register Number already exists' }, { status: 400 });
    }

    // Transaction to create User + Student
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          collegeId: collegeId.toUpperCase().trim(),
          name,
          dob: new Date(dob),
          role: 'STUDENT',
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          registerNo: registerNo.toUpperCase().trim(),
          departmentId,
          year,
          semester,
          section: section.toUpperCase().trim(),
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return NextResponse.json({ message: 'Student created successfully', student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}