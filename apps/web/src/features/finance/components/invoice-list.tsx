'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { InvoiceListItemView } from '@core-crm/shared/client';
import dayjs from 'dayjs';

import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

import { useInvoices } from '../api/use-invoices';
import { useFinanceParams } from '../hooks/use-finance-params';
import { formatMoney } from '../finance.format';
import { INVOICE_STATUS_LABELS, labelOf } from '../finance.labels';

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ISSUED: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
  CANCELLED: 'outline',
};

export function InvoiceList({ clinicId }: { clinicId: string }) {
  const { actor } = useAuth();
  const { pagination, setParam } = useFinanceParams();

  const organizationId = actor?.organizationId;

  const { data, isPending, isFetching, error } = useInvoices({
    // `organizationId` uçta zorunlu (ParseUUIDPipe); aktör yüklenene kadar
    // istek atılmaz, yoksa 400 dönerdi.
    filter: { organizationId: organizationId ?? '', clinicId },
    pagination,
    enabled: Boolean(organizationId),
  });

  const columns = useMemo<ColumnDef<InvoiceListItemView, unknown>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Fatura no',
        cell: ({ row }) => row.original.invoiceNumber ?? '—',
      },
      {
        accessorKey: 'issuedAt',
        header: 'Kesim',
        cell: ({ row }) =>
          row.original.issuedAt
            ? dayjs(row.original.issuedAt).format('DD.MM.YYYY')
            : '—',
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANTS[row.original.status ?? ''] ?? 'outline'}>
            {labelOf(INVOICE_STATUS_LABELS, row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: 'grandTotal',
        header: 'Tutar',
        cell: ({ row }) => {
          const total = formatMoney(
            row.original.grandTotal,
            row.original.currency
          );
          return total ?? <span className="text-muted-foreground">gizli</span>;
        },
      },
    ],
    []
  );

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError
          ? error.message
          : 'Fatura listesi yüklenemedi.'}
      </p>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      pagination={data?.pagination}
      isLoading={isPending}
      isFetching={isFetching}
      emptyMessage="Bu klinikte fatura bulunamadı."
      onPageChange={(page) => setParam('page', String(page))}
    />
  );
}
