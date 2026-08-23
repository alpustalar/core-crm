'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ClinicCalendarEvent } from '@core-crm/shared/client';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';

import {
  useAppointmentDailySummary,
  useAppointmentDay,
} from '../api/use-appointment-day';
import { useAppointmentDayParams } from '../hooks/use-appointment-day-params';
import type { AppointmentStatus } from '../appointment.types';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { AppointmentDaySummary } from './appointment-day-summary';
import { AppointmentActions } from './appointment-actions';
import { ScheduleAppointmentDialog } from './schedule-appointment-dialog';

/**
 * Günlük ajanda. Ay ızgarası yerine gün görünümü seçildi: resepsiyonun gerçek
 * iş birimi bir gün — kim geldi, kim onaylanacak, kim gelmedi. Gün, doktor ve
 * durum filtresi URL'de taşınır, böylece "yarının listesi" paylaşılabilir bir
 * bağlantı olur.
 */
export function AppointmentDay({ clinicId }: { clinicId: string }) {
  const { date, providerId, status, setParam, shiftDay } =
    useAppointmentDayParams();

  const { data, isPending, isFetching, error } = useAppointmentDay({
    clinicId,
    date,
    providerId,
    status,
  });

  const summary = useAppointmentDailySummary({ clinicId, date, providerId });

  const columns = useMemo<ColumnDef<ClinicCalendarEvent, unknown>[]>(
    () => [
      {
        accessorKey: 'startTime',
        header: 'Saat',
        cell: ({ row }) =>
          `${dayjs(row.original.startTime).format('HH:mm')} – ${dayjs(
            row.original.endTime
          ).format('HH:mm')}`,
      },
      {
        accessorKey: 'patientName',
        header: 'Hasta',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.patientName}</span>
            <span className="text-muted-foreground text-xs">
              {row.original.patientPhone}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'providerName',
        header: 'Doktor',
        cell: ({ row }) => row.original.providerName ?? '—',
      },
      {
        accessorKey: 'treatmentType',
        header: 'Tedavi',
        cell: ({ row }) =>
          row.original.isConsultation
            ? 'Konsültasyon'
            : (row.original.treatmentType ?? '—'),
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Can capability="appointment:update">
            <AppointmentActions clinicId={clinicId} event={row.original} />
          </Can>
        ),
      },
    ],
    [clinicId]
  );

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError ? error.message : 'Ajanda yüklenemedi.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Önceki gün"
          onClick={() => shiftDay(-1)}
        >
          <ChevronLeft />
        </Button>

        <Input
          type="date"
          value={date}
          onChange={(event) => setParam('date', event.target.value)}
          className="w-auto"
        />

        <Button
          variant="outline"
          size="icon"
          aria-label="Sonraki gün"
          onClick={() => shiftDay(1)}
        >
          <ChevronRight />
        </Button>

        <Button
          variant="ghost"
          onClick={() => setParam('date', dayjs().format('YYYY-MM-DD'))}
        >
          Bugün
        </Button>

        <div className="ml-auto">
          <Can capability="appointment:create">
            <ScheduleAppointmentDialog clinicId={clinicId} defaultDate={date} />
          </Can>
        </div>
      </div>

      <AppointmentDaySummary
        summary={summary.data}
        isLoading={summary.isPending}
        activeStatus={status}
        onSelectStatus={(next: AppointmentStatus | undefined) =>
          setParam('status', next)
        }
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage="Bu günde randevu yok."
      />
    </div>
  );
}
