import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'PRIMARY_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Primary Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const admin = await prisma.user.findUnique({ where: { id } });

    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Rule: Cannot delete Primary Admin!
    if (admin.role === 'PRIMARY_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete Primary Admin' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Secondary Admin deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
