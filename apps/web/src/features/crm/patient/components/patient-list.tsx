'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { Patient } from '@core-crm/shared/client';
import dayjs from 'dayjs';

import { DataTable } from '@/components/data-table/data-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/lib/api';

import { usePatients } from '../api/use-patients';
import { usePatientListParams } from '../hooks/use-patient-list-params';
import {
  PATIENT_STATUS_LABELS,
  PatientStatusBadge,
} from './patient-status-badge';

const ALL = '__all__';

export function PatientList({ clinicId }: { clinicId: string }) {
  const router = useRouter();
  const { filter, pagination, setParam } = usePatientListParams(clinicId);
  const { data, isPending, isFetching, error } = usePatients({
    filter,
    pagination,
  });

  const columns = useMemo<ColumnDef<Patient, unknown>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Ad Soyad',
        cell: ({ row }) =>
          [row.original.firstName, row.original.lastName]
            .filter(Boolean)
            .join(' '),
      },
      {
        accessorKey: 'protocolNo',
        header: 'Protokol',
        cell: ({ row }) => row.original.protocolNo ?? '—',
      },
      {
        // PII: policy grubu yoksa backend bu alanı cevaptan siler; hücre o
        // durumda "—" gösterir, kırık bir "undefined" değil.
        accessorKey: 'phone',
        header: 'Telefon',
        cell: ({ row }) => row.original.phone ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => <PatientStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Kayıt',
        cell: ({ row }) => dayjs(row.original.createdAt).format('DD.MM.YYYY'),
      },
    ],
    []
  );

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError ? error.message : 'Hasta listesi yüklenemedi.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Ad, telefon veya protokol no…"
          defaultValue={filter.search ?? ''}
          onChange={(event) =>
            setParam('search', event.target.value.trim() || undefined)
          }
          className="max-w-xs"
        />

        <Select
          value={filter.status ?? ALL}
          onValueChange={(value) =>
            setParam('status', value === ALL ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm durumlar</SelectItem>
            {Object.entries(PATIENT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.clinicId ? 'clinic' : 'org'}
          onValueChange={(value) =>
            setParam('scope', value === 'org' ? 'org' : undefined)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Kapsam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clinic">Bu klinik</SelectItem>
            <SelectItem value="org">Tüm organizasyon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage="Bu filtrelerle hasta bulunamadı."
        onPageChange={(page) => setParam('page', String(page))}
        onRowClick={(patient) =>
          router.push(`/clinics/${clinicId}/patients/${patient.id}`)
        }
      />
    </div>
  );
}
