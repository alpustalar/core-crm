'use client';

import { useCapability } from '@/lib/auth/use-capability';

/**
 * `<Can capability="lead:create"><Button …/></Can>`
 *
 * UI'da gizlemek güvenlik değil, UX'tir — kullanıcının yapamayacağı bir işlemin
 * butonunu göstermemek için. Kapıyı backend tutar.
 */
export function Can({
  capability,
  children,
  fallback = null,
}: {
  capability: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return useCapability(capability) ? <>{children}</> : <>{fallback}</>;
}
