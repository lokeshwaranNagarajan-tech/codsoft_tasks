import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (status && status !== 'ALL') where.status = status;

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: { include: { user: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary stats
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
    const totalExpected = fees.reduce((sum, f) => sum + f.totalFee, 0);

    return NextResponse.json({
      fees,
      summary: {
        totalCollected,
        totalPending,
        totalExpected,
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

    const { studentId, totalFee, paidAmount, paymentDate } = await request.json();
    if (!studentId || totalFee === undefined || paidAmount === undefined) {
      return NextResponse.json({ error: 'Student, total fee, and paid amount are required' }, { status: 400 });
    }

    const total = parseFloat(totalFee);
    const paid = parseFloat(paidAmount);
    const pending = Math.max(0, total - paid);

    let status: 'PAID' | 'PENDING' | 'PARTIAL' = 'PENDING';
    if (paid >= total) status = 'PAID';
    else if (paid > 0) status = 'PARTIAL';

    const pDate = paymentDate ? new Date(paymentDate) : paid > 0 ? new Date() : null;

    // Check existing fee record for student or create new
    const existing = await prisma.fee.findFirst({ where: { studentId } });

    let fee;
    if (existing) {
      fee = await prisma.fee.update({
        where: { id: existing.id },
        data: {
          totalFee: total,
          paidAmount: paid,
          pendingAmount: pending,
          status,
          paymentDate: pDate,
        },
        include: { student: { include: { user: true, department: true } } },
      });
    } else {
      fee = await prisma.fee.create({
        data: {
          studentId,
          totalFee: total,
          paidAmount: paid,
          pendingAmount: pending,
          status,
          paymentDate: pDate,
        },
        include: { student: { include: { user: true, department: true } } },
      });
    }

    return NextResponse.json({ message: 'Fee record saved successfully', fee });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
