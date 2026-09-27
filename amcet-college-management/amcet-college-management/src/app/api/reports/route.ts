import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PRIMARY_ADMIN' && session.role !== 'SECONDARY_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { students: true, faculties: true, subjects: true } },
      },
    });

    const students = await prisma.student.findMany({
      include: { department: true, fees: true, attendances: true, marks: true },
    });

    // 1. Department Strength
    const deptStrength = departments.map((d) => ({
      name: d.code,
      fullName: d.name,
      students: d._count.students,
      faculty: d._count.faculties,
      subjects: d._count.subjects,
    }));

    // 2. Fee Collection Analytics
    const feeSummary = departments.map((d) => {
      const deptStudents = students.filter((s) => s.departmentId === d.id);
      let collected = 0;
      let pending = 0;
      deptStudents.forEach((s) => {
        s.fees.forEach((f) => {
          collected += f.paidAmount;
          pending += f.pendingAmount;
        });
      });
      return {
        name: d.code,
        collected,
        pending,
      };
    });

    // 3. Attendance Analytics
    const attendanceSummary = departments.map((d) => {
      const deptStudents = students.filter((s) => s.departmentId === d.id);
      let totalRecords = 0;
      let presentRecords = 0;
      deptStudents.forEach((s) => {
        totalRecords += s.attendances.length;
        presentRecords += s.attendances.filter((a) => a.status === 'PRESENT').length;
      });
      const percentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100 * 10) / 10 : 95;
      return {
        name: d.code,
        attendancePct: percentage,
      };
    });

    // 4. Exam Performance Summary
    const exams = await prisma.exam.findMany({
      include: { marks: true },
    });

    const examSummary = exams.map((e) => {
      const totalMarks = e.marks.reduce((sum, m) => sum + m.marks, 0);
      const avg = e.marks.length > 0 ? Math.round((totalMarks / e.marks.length) * 10) / 10 : 0;
      const passCount = e.marks.filter((m) => m.marks >= 40).length;
      const passRate = e.marks.length > 0 ? Math.round((passCount / e.marks.length) * 100) : 0;
      return {
        name: e.name,
        averageMarks: avg,
        passRate,
      };
    });

    return NextResponse.json({
      deptStrength,
      feeSummary,
      attendanceSummary,
      examSummary,
      totalStudents: students.length,
      totalFaculty: await prisma.faculty.count(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
