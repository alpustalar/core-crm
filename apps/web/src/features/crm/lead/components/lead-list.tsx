'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Lead } from '@core-crm/shared/client';
import dayjs from 'dayjs';

import { DataTable } from '@/components/data-table/data-table';
import { Can } from '@/components/can';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/lib/api';

import { useLeads } from '../api/use-leads';
import { useLeadListParams } from '../hooks/use-lead-list-params';
import { LEAD_SOURCE_LABELS } from '../lead.labels';
import { LEAD_STATUS_LABELS, LeadStatusBadge } from './lead-status-badge';
import { CreateLeadDialog } from './create-lead-dialog';

const ALL = '__all__';

export function LeadList({ clinicId }: { clinicId: string }) {
  const { filter, pagination, setParam } = useLeadListParams();
  const { data, isPending, isFetching, error } = useLeads({
    clinicId,
    filter,
    pagination,
  });

  const columns = useMemo<ColumnDef<Lead, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Ad',
        cell: ({ row }) => row.original.name ?? '—',
      },
      {
        accessorKey: 'phone',
        header: 'Telefon',
        cell: ({ row }) => row.original.phone ?? '—',
      },
      {
        accessorKey: 'source',
        header: 'Kaynak',
        cell: ({ row }) => LEAD_SOURCE_LABELS[row.original.source] ?? row.original.source,
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Oluşturma',
        cell: ({ row }) => dayjs(row.original.createdAt).format('DD.MM.YYYY HH:mm'),
      },
    ],
    []
  );

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError
          ? error.message
          : 'Lead listesi yüklenemedi.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Ada göre ara…"
          defaultValue={pagination.search ?? ''}
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
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.source ?? ALL}
          onValueChange={(value) =>
            setParam('source', value === ALL ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Kaynak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm kaynaklar</SelectItem>
            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          {/*
            Butonu gizlemek güvenlik değil, UX. Yetkisi olmayan biri yine de
            isteği atabilir; `CapabilityGuard` orada durur.
          */}
          <Can capability="lead:create">
            <CreateLeadDialog clinicId={clinicId} />
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage="Bu filtrelerle lead bulunamadı."
        onPageChange={(page) => setParam('page', String(page))}
      />
    </div>
  );
}
