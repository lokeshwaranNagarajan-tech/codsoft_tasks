import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { z } from 'zod';

const createFacultySchema = z.object({
  collegeId: z.string().min(1, 'Faculty ID is required'),
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  designation: z.string().min(1, 'Designation is required'),
  departmentId: z.string().min(1, 'Department is required'),
  isHOD: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const search = searchParams.get('search');

    const where: any = {};
    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { collegeId: { contains: search, mode: 'insensitive' } } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const facultyList = await prisma.faculty.findMany({
      where,
      include: {
        user: true,
        department: true,
        subjects: {
          include: { subject: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ faculty: facultyList });
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
    const parsed = createFacultySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { collegeId, name, dob, designation, departmentId, isHOD } = parsed.data;

    const existingCollege = await prisma.user.findUnique({ where: { collegeId } });
    if (existingCollege) {
      return NextResponse.json({ error: 'Faculty College ID already exists' }, { status: 400 });
    }

    const faculty = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          collegeId: collegeId.toUpperCase().trim(),
          name,
          dob: new Date(dob),
          role: 'FACULTY',
        },
      });

      if (isHOD) {
        // Clear previous HOD of department
        await tx.faculty.updateMany({
          where: { departmentId, isHOD: true },
          data: { isHOD: false },
        });
      }

      return tx.faculty.create({
        data: {
          userId: user.id,
          departmentId,
          designation,
          isHOD: isHOD || false,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return NextResponse.json({ message: 'Faculty created successfully', faculty }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
