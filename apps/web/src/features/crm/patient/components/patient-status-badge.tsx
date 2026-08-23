import { Badge } from '@/components/ui/badge';

import type { PatientStatus } from '../patient.types';

const STATUS_LABELS: Record<PatientStatus, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Pasif',
  ARCHIVED: 'Arşiv',
  DECEASED: 'Vefat',
  BLACKLISTED: 'Kara liste',
};

const STATUS_VARIANTS: Record<
  PatientStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  ARCHIVED: 'outline',
  DECEASED: 'outline',
  BLACKLISTED: 'destructive',
};

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export { STATUS_LABELS as PATIENT_STATUS_LABELS };
