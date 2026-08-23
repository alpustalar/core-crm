'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { ClinicCalendarEvent } from '@core-crm/shared/client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiError } from '@/lib/api';

import {
  useAppointmentTransition,
  useCancelAppointment,
} from '../api/use-appointment-mutations';
import type { AppointmentStatus } from '../appointment.types';

type Transition = 'confirm' | 'checkIn' | 'complete' | 'noShow';

/**
 * Hangi geçişin sunulacağını **mevcut durum** belirler. Backend zaten
 * izin vermeyeni reddediyor (entity durum makinesi); burada listelememek
 * kullanıcıyı kesin başarısız olacak bir tıklamadan korur.
 */
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, Transition[]> = {
  PENDING: ['confirm', 'checkIn', 'noShow'],
  CONFIRMED: ['checkIn', 'complete', 'noShow'],
  ARRIVED: ['complete'],
  COMPLETED: [],
  CANCELLED: [],
  NOSHOW: [],
};

const TRANSITION_LABELS: Record<Transition, string> = {
  confirm: 'Onayla',
  checkIn: 'Geldi işaretle',
  complete: 'Tamamlandı',
  noShow: 'Gelmedi',
};

const CANCELLABLE: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'ARRIVED'];

export function AppointmentActions({
  clinicId,
  event,
}: {
  clinicId: string;
  event: ClinicCalendarEvent;
}) {
  const [error, setError] = useState<string | null>(null);
  const transition = useAppointmentTransition(clinicId);
  const cancel = useCancelAppointment(clinicId);

  const transitions = ALLOWED_TRANSITIONS[event.status];
  const canCancel = CANCELLABLE.includes(event.status);

  if (transitions.length === 0 && !canCancel) return null;

  const run = async (work: () => Promise<unknown>) => {
    setError(null);
    try {
      await work();
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : 'İşlem tamamlanamadı.'
      );
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {error && (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Randevu işlemleri">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {transitions.map((name) => (
            <DropdownMenuItem
              key={name}
              onSelect={() =>
                void run(() =>
                  transition.mutateAsync({
                    appointmentId: event.appointmentId,
                    transition: name,
                  })
                )
              }
            >
              {TRANSITION_LABELS[name]}
            </DropdownMenuItem>
          ))}

          {canCancel && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() =>
                void run(() =>
                  cancel.mutateAsync({ appointmentId: event.appointmentId })
                )
              }
            >
              İptal et
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
