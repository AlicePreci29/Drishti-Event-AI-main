
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('authenticated');
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  // Render nothing while redirecting
  return null;
}
