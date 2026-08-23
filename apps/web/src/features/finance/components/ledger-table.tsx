'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ClinicLedgerEntry } from '@core-crm/shared/client';
import dayjs from 'dayjs';

import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';

import { useClinicFinanceSummary, useClinicLedger } from '../api/use-clinic-ledger';
import { useFinanceParams } from '../hooks/use-finance-params';
import { formatAmount } from '../finance.format';
import {
  LEDGER_CATEGORY_LABELS,
  LEDGER_STATUS_LABELS,
  LEDGER_TYPE_LABELS,
  labelOf,
} from '../finance.labels';
import { FinanceSummaryCards } from './finance-summary-cards';

export function LedgerTable({ clinicId }: { clinicId: string }) {
  const { range, pagination, setParam } = useFinanceParams();

  const summary = useClinicFinanceSummary({ clinicId, range });
  const ledger = useClinicLedger({ clinicId, pagination });

  const columns = useMemo<ColumnDef<ClinicLedgerEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'entryDate',
        header: 'Tarih',
        cell: ({ row }) =>
          row.original.entryDate
            ? dayjs(row.original.entryDate).format('DD.MM.YYYY')
            : '—',
      },
      {
        accessorKey: 'type',
        header: 'Tür',
        cell: ({ row }) => (
          <Badge
            variant={row.original.type === 'EXPENSE' ? 'secondary' : 'default'}
          >
            {labelOf(LEDGER_TYPE_LABELS, row.original.type)}
          </Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ row }) =>
          labelOf(LEDGER_CATEGORY_LABELS, row.original.category),
      },
      {
        accessorKey: 'description',
        header: 'Açıklama',
        cell: ({ row }) => row.original.description ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => labelOf(LEDGER_STATUS_LABELS, row.original.status),
      },
      {
        accessorKey: 'amount',
        header: 'Tutar',
        cell: ({ row }) => {
          // Tutar finans tier'ında: yetkisi olmayan aktörün cevabında alan hiç
          // yok. Kilit ikonu "burada bir değer var ama sana kapalı" der; "—"
          // yazsaydık kayıt tutarsız görünürdü.
          const amount = formatAmount(row.original.amount, row.original.currency);
          if (amount === undefined) {
            return <span className="text-muted-foreground">gizli</span>;
          }

          const isExpense = row.original.type === 'EXPENSE';
          return (
            <span className={isExpense ? 'text-destructive' : undefined}>
              {isExpense ? `−${amount}` : amount}
            </span>
          );
        },
      },
    ],
    []
  );

  const error = summary.error ?? ledger.error;
  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError ? error.message : 'Cari defter yüklenemedi.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Başlangıç</span>
          <Input
            type="date"
            value={range.dateFrom?.slice(0, 10) ?? ''}
            onChange={(event) =>
              setParam('dateFrom', event.target.value || undefined)
            }
            className="w-40"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Bitiş</span>
          <Input
            type="date"
            value={range.dateTo?.slice(0, 10) ?? ''}
            onChange={(event) =>
              setParam('dateTo', event.target.value || undefined)
            }
            className="w-40"
          />
        </label>
      </div>

      {/*
        Tarih aralığı yalnız ÖZETİ daraltır — hareket listesi ucu tarih filtresi
        almıyor (`GetLedgerByClinicIdQuery` yalnız sayfalama alıyor). Bunu
        gizlemek yerine söylüyoruz; aksi hâlde kullanıcı listenin de filtrelendiğini
        sanardı.
      */}
      <FinanceSummaryCards
        summary={summary.data}
        isLoading={summary.isPending}
      />
      {(range.dateFrom || range.dateTo) && (
        <p className="text-muted-foreground text-xs">
          Tarih aralığı yalnızca yukarıdaki özete uygulanır; aşağıdaki hareket
          listesi tüm dönemi gösterir.
        </p>
      )}

      <DataTable
        columns={columns}
        data={ledger.data?.data ?? []}
        pagination={ledger.data?.pagination}
        isLoading={ledger.isPending}
        isFetching={ledger.isFetching}
        emptyMessage="Bu klinikte cari hareket bulunamadı."
        onPageChange={(page) => setParam('page', String(page))}
      />
    </div>
  );
}
