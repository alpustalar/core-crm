'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Can } from '@/components/can';
import { cn } from '@/lib/utils';

/**
 * Cari defter ve faturalar ayrı **rotalar**, istemci tarafı sekme değil: ikisi
 * ayrı yetkinliklerle korunuyor (`financeledger:read` / `invoice:read`) ve ayrı
 * bağlantı olarak paylaşılabilmeleri gerekiyor. Sekme durumu bileşen state'inde
 * dursaydı hiçbiri mümkün olmazdı.
 */
export function FinanceTabs({ clinicId }: { clinicId: string }) {
  const pathname = usePathname();
  const base = `/clinics/${clinicId}/finance`;

  const tabs = [
    { href: base, label: 'Cari defter', capability: 'financeledger:read' },
    {
      href: `${base}/invoices`,
      label: 'Faturalar',
      capability: 'invoice:read',
    },
  ];

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <Can key={tab.href} capability={tab.capability}>
          <Link
            href={tab.href}
            aria-current={pathname === tab.href ? 'page' : undefined}
            className={cn(
              'border-b-2 border-transparent px-3 py-2 text-sm',
              pathname === tab.href
                ? 'border-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        </Can>
      ))}
    </nav>
  );
}
