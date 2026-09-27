'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMenuRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/menu');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-sm font-semibold">Redirecting to Admin Menu Manager...</p>
      </div>
    </div>
  );
}
