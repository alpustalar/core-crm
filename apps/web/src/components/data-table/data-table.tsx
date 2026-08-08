'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@core-crm/shared/client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/*
 * Modül düzeyinde bir kez kuruluyor. Bileşenin içinde çağrılırsa React Compiler
 * "fonksiyon döndüren API" görüp bileşeni memoize etmekten vazgeçiyor; oysa
 * dönen değer tablo örneğine bağlı değil, paylaşılabilir.
 */
const coreRowModel = getCoreRowModel();

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pagination?: PaginationMeta;
  isLoading?: boolean;
  isFetching?: boolean;
  emptyMessage?: string;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: TData) => void;
}

/**
 * Sayfalama **sunucu taraflı**: TanStack Table'ın kendi sayfalama satır modeli
 * (`getPaginationRowModel`) bilerek kullanılmıyor — o, elindeki diziyi böler ve
 * bizde elde yalnız içinde bulunulan sayfa var. Toplam/sayfa sayısı cevabın
 * `meta.pagination`ından gelir.
 *
 * Faz 2'nin şablon parçası: sonraki her liste ekranı bunu kullanır.
 *
 * Not: ESLint burada `react-hooks/incompatible-library` uyarısı verir —
 * `useReactTable` metot taşıyan bir nesne döndürdüğü için React Compiler bu
 * bileşeni memoize etmekten vazgeçer. TanStack Table v8'in doğasında var,
 * doğruluk sorunu değil; kovalamaya değmez.
 */
export function DataTable<TData>({
  columns,
  data,
  pagination,
  isLoading,
  isFetching,
  emptyMessage = 'Kayıt bulunamadı.',
  onPageChange,
  onRowClick,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: coreRowModel,
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  });

  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_column, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {pagination
            ? `${pagination.total} kayıt · sayfa ${page}/${Math.max(totalPages, 1)}`
            : null}
          {isFetching && !isLoading ? ' · yenileniyor…' : ''}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || !onPageChange}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft />
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || !onPageChange}
            onClick={() => onPageChange?.(page + 1)}
          >
            Sonraki
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
