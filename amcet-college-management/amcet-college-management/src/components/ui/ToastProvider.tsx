'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1E293B',
          color: '#F8FAFC',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          border: '1px solid #334155',
        },
      }}
    />
  );
}
