import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'amcet-super-secret-jwt-key-2026';

export interface UserPayload {
  userId: string;
  collegeId: string;
  name: string;
  role: 'PRIMARY_ADMIN' | 'SECONDARY_ADMIN' | 'FACULTY' | 'STUDENT';
  studentId?: string;
  facultyId?: string;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('amcet_token')?.value;

  if (!token) return null;
  return verifyToken(token);
}

export async function getFullCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      student: {
        include: {
          department: true,
        },
      },
      faculty: {
        include: {
          department: true,
        },
      },
    },
  });

  return user;
}
