'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIProvidersRedirect(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs font-mono text-[#8C8E9A]">
      Redirecting to Workspace &amp; Billing...
    </div>
  );
}
