import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'PRIMARY_ADMIN' || session.role === 'SECONDARY_ADMIN') {
    redirect('/admin');
  } else if (session.role === 'FACULTY') {
    redirect('/faculty');
  } else if (session.role === 'STUDENT') {
    redirect('/student');
  }

  redirect('/login');
}
