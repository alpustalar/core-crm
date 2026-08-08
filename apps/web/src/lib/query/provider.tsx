'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { makeQueryClient } from './client';

/**
 * `useState` ile bir kez kuruluyor — modül düzeyinde tutulsaydı sunucu tarafı
 * render'da tüm kullanıcılar aynı cache'i paylaşırdı.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
