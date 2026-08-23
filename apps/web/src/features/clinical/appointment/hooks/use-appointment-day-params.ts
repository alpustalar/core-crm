'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

import type { AppointmentStatus } from '../appointment.types';

export interface AppointmentDayParams {
  /** 'YYYY-MM-DD' — varsayılan bugün. */
  date: string;
  providerId?: string;
  status?: AppointmentStatus;
}

/**
 * Gün, doktor ve durum filtresi URL'de taşınır (Lead diliminde olduğu gibi):
 * "yarının ajandası" bir bağlantı olarak paylaşılabilir, geri tuşu gün gün
 * çalışır, yenilemede seçim kaybolmaz.
 */
export function useAppointmentDayParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo<AppointmentDayParams>(() => {
    const date = searchParams.get('date');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');

    return {
      date:
        date && dayjs(date).isValid()
          ? dayjs(date).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
      providerId: providerId ?? undefined,
      status: (status as AppointmentStatus | null) ?? undefined,
    };
  }, [searchParams]);

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());

      if (value) next.set(key, value);
      else next.delete(key);

      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const shiftDay = useCallback(
    (days: number) =>
      setParam('date', dayjs(params.date).add(days, 'day').format('YYYY-MM-DD')),
    [params.date, setParam]
  );

  return { ...params, setParam, shiftDay };
}
