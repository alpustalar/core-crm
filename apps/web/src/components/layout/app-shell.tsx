'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

import { AppSidebar } from './app-sidebar';
import { AppTopbar } from './app-topbar';

/**
 * `middleware.ts` yalnız çereze bakıyor. Burada ikinci bir kapı var çünkü çerez
 * duruyor olsa da token süresi dolmuş ya da kullanıcı başka sekmeden çıkmış
 * olabilir — o durumda aktör bağlamı çekilemez ve kabuk boş boş beklerdi.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-svh flex-col gap-4 p-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
