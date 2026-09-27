import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { collegeId, dob } = parsed.data;

    // Find user by collegeId
    const user = await prisma.user.findUnique({
      where: { collegeId: collegeId.toUpperCase().trim() },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid College ID or Date of Birth' },
        { status: 401 }
      );
    }

    // Verify DOB (Compare YYYY-MM-DD strings)
    const userDobStr = new Date(user.dob).toISOString().split('T')[0];
    const inputDobStr = new Date(dob).toISOString().split('T')[0];

    if (userDobStr !== inputDobStr) {
      return NextResponse.json(
        { error: 'Invalid College ID or Date of Birth' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      collegeId: user.collegeId,
      name: user.name,
      role: user.role,
      studentId: user.student?.id,
      facultyId: user.faculty?.id,
    };

    const token = signToken(tokenPayload);

    // Create response & set HTTP-only cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        collegeId: user.collegeId,
        name: user.name,
        role: user.role,
      },
      redirectUrl:
        user.role === 'PRIMARY_ADMIN' || user.role === 'SECONDARY_ADMIN'
          ? '/admin'
          : user.role === 'FACULTY'
          ? '/faculty'
          : '/student',
    });

    response.cookies.set({
      name: 'amcet_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}