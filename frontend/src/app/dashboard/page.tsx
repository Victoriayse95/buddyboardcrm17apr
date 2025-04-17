'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/home');
  }, [router]);

  return null;
}