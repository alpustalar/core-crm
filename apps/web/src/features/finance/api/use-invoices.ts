'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  invoiceEndpoints,
  type GetInvoices,
  type PaginationInput,
} from '@core-crm/shared/client';

import { apiWithMeta } from '@/lib/api';

import { invoiceKeys } from './finance.keys';

interface UseInvoicesParams {
  filter: GetInvoices;
  pagination?: PaginationInput;
  enabled?: boolean;
}

/**
 * `enabled` var çünkü `organizationId` aktör bağlamından geliyor ve ilk
 * render'da henüz yüklenmemiş olabilir. Zorunlu alan boşken istek atmak
 * backend'den 400 alırdı (`ParseUUIDPipe`).
 */
export function useInvoices({
  filter,
  pagination,
  enabled = true,
}: UseInvoicesParams) {
  return useQuery({
    queryKey: invoiceKeys.list(filter, pagination),
    queryFn: ({ signal }) =>
      apiWithMeta(invoiceEndpoints.list, {
        query: filter,
        pagination,
        signal,
      }),
    enabled,
    placeholderData: keepPreviousData,
  });
}
