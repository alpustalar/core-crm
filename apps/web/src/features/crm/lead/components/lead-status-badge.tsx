import { Badge } from '@/components/ui/badge';

import type { LeadStatus } from '../lead.types';

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Yeni',
  CONTACTED: 'İletişime geçildi',
  QUALIFIED: 'Nitelikli',
  CONVERTED: 'Dönüştü',
  LOST: 'Kaybedildi',
};

const STATUS_VARIANTS: Record<
  LeadStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'default',
  CONTACTED: 'secondary',
  QUALIFIED: 'secondary',
  CONVERTED: 'outline',
  LOST: 'destructive',
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export { STATUS_LABELS as LEAD_STATUS_LABELS };
