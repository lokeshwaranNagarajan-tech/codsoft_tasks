import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { calculateGPA } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const examId = searchParams.get('examId');
    const subjectId = searchParams.get('subjectId');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (examId) where.examId = examId;
    if (subjectId) where.subjectId = subjectId;

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: { include: { user: true, department: true } },
        subject: true,
        exam: true,
      },
      orderBy: { exam: { name: 'asc' } },
    });

    let resultSummary = null;
    if (studentId) {
      resultSummary = calculateGPA(marks);
    }

    return NextResponse.json({ marks, summary: resultSummary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'FACULTY' && session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { examId, subjectId, records } = body;
    // records: Array of { studentId: string, marks: number }

    if (!examId || !subjectId || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Exam ID, Subject ID, and records array are required' }, { status: 400 });
    }

    const upsertPromises = records.map((rec: { studentId: string; marks: number }) => {
      const score = Math.max(0, Math.min(100, parseFloat(rec.marks.toString())));
      return prisma.mark.upsert({
        where: {
          studentId_subjectId_examId: {
            studentId: rec.studentId,
            subjectId,
            examId,
          },
        },
        update: { marks: score },
        create: {
          studentId: rec.studentId,
          subjectId,
          examId,
          marks: score,
        },
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ message: 'Marks updated successfully', count: records.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
