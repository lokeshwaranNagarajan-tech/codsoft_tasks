import { NextResponse } from 'next/server';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
