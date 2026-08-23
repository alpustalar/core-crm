'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { GetLedgerSummary, PaginationInput } from '@core-crm/shared/client';

const PAGE_SIZE = 20;

export interface FinanceParams {
  range: GetLedgerSummary;
  pagination: PaginationInput;
}

/**
 * Tarih aralığı ve sayfa URL'de taşınır: "geçen ayın cirosu" paylaşılabilir bir
 * bağlantı olur ve tarayıcı geri tuşu beklendiği gibi çalışır.
 *
 * Aralık **boş bırakılabilir** — backend `dateFrom`/`dateTo` opsiyonel, verilmezse
 * tüm defteri özetler. Burada varsayılan bir aralık uydurmuyoruz: "bu ay" gibi bir
 * varsayılan, kullanıcının gördüğü rakamın hangi dönem olduğunu belirsizleştirirdi.
 */
export function useFinanceParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo<FinanceParams>(() => {
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = Number(searchParams.get('page') ?? '1');

    return {
      range: {
        dateFrom: dateFrom ?? undefined,
        dateTo: dateTo ?? undefined,
      },
      pagination: {
        page: Number.isFinite(page) && page > 0 ? page : 1,
        limit: PAGE_SIZE,
      },
    };
  }, [searchParams]);

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());

      if (value) next.set(key, value);
      else next.delete(key);

      // Filtre değişince sayfa başa döner; 7. sayfada duran bir kullanıcı
      // aralığı daralttığında boş tabloya bakardı.
      if (key !== 'page') next.delete('page');

      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { ...params, setParam };
}
