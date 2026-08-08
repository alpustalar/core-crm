'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { actorHasCapability } from '@/lib/auth/use-capability';

import { NAV_ITEMS } from './nav.config';

export function AppSidebar() {
  const pathname = usePathname();
  const { actor } = useAuth();

  const clinicId = actor?.clinicId ?? actor?.managedClinics[0];

  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-60 shrink-0 border-r md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-5 font-semibold">
        Core CRM
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.filter(
          (item) =>
            (!item.capability || actorHasCapability(actor, item.capability)) &&
            (!item.requiresClinic || Boolean(clinicId))
        ).map((item) => {
          const href = item.href({ clinicId });
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'hover:bg-sidebar-accent/60'
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
