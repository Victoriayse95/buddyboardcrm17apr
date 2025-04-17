'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the upcoming page when this root dashboard route is accessed directly
    router.push('/dashboard/upcoming');
  }, [router]);

  return null; // No need to render anything since we're redirecting
} 