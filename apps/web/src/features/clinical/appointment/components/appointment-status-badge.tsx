import { Badge } from '@/components/ui/badge';

import type { AppointmentStatus } from '../appointment.types';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Onay bekliyor',
  CONFIRMED: 'Onaylandı',
  ARRIVED: 'Geldi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  NOSHOW: 'Gelmedi',
};

const STATUS_VARIANTS: Record<
  AppointmentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'default',
  CONFIRMED: 'secondary',
  ARRIVED: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  NOSHOW: 'destructive',
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}

export { STATUS_LABELS as APPOINTMENT_STATUS_LABELS };
