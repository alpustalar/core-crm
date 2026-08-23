'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import {
  ScheduleAppointmentSchema,
  type ScheduleAppointment,
  type ScheduleAppointmentInput,
  type SlotConflictMeta,
} from '@core-crm/shared/client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';

import { useScheduleAppointment } from '../api/use-appointment-mutations';
import { APPOINTMENT_ERROR_CODES } from '../appointment.error-codes';

/**
 * Form şeması `shared`taki `ScheduleAppointmentSchema`nın kendisi — "hasta ID
 * veya ad+telefon" kuralı (`superRefine`) bu sayede istemcide de aynen işler,
 * kopyalanmaz.
 */
export function ScheduleAppointmentDialog({
  clinicId,
  defaultDate,
}: {
  clinicId: string;
  /** Ajandada seçili gün — yeni randevu varsayılan olarak o güne açılır. */
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const schedule = useScheduleAppointment(clinicId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    // Giriş ve çıkış tipleri ayrı veriliyor: `startTime` şemada
    // `z.coerce.date()` — form `<input type="datetime-local">`ten string alır,
    // Zod `Date`e çevirir. Tek tiple yazılsaydı resolver uyuşmazdı.
  } = useForm<ScheduleAppointmentInput, unknown, ScheduleAppointment>({
    resolver: zodResolver(ScheduleAppointmentSchema),
    defaultValues: {
      clinicId,
      isConsultation: false,
      duration: 30,
      startTime: dayjs(defaultDate).hour(9).minute(0).second(0).toDate(),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await schedule.mutateAsync(values);
      reset();
      setOpen(false);
    } catch (error) {
      // Çakışma hatası tipli `meta` taşır (`SlotConflictMeta`) — backend'in
      // exception'ı ile bu ekran **aynı arayüzü** import eder. Kullanıcıya
      // "dolu" demek yerine çakışan aralığı göstermek eyleme dönüştürülebilir.
      if (
        error instanceof ApiError &&
        error.code === APPOINTMENT_ERROR_CODES.ALREADY_BOOKED
      ) {
        const meta = error.meta as SlotConflictMeta | undefined;

        setServerError(
          meta
            ? `Bu saatte çakışan randevu var: ${dayjs(meta.conflictStart).format('HH:mm')}–${dayjs(meta.conflictEnd).format('HH:mm')}`
            : 'Seçilen saat dolu.'
        );
        return;
      }

      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Randevu oluşturulamadı. Tekrar dene.'
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Yeni randevu
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni randevu</DialogTitle>
          <DialogDescription>
            Kayıtlı hasta seçilmediyse ad ve telefon zorunludur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="patientName">Hasta adı</Label>
            <Input id="patientName" {...register('patientName')} />
            {errors.patientName && (
              <p className="text-destructive text-sm">
                {errors.patientName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="patientPhone">Telefon</Label>
            <Input
              id="patientPhone"
              inputMode="tel"
              {...register('patientPhone')}
            />
            {errors.patientPhone && (
              <p className="text-destructive text-sm">
                {errors.patientPhone.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="providerId">Doktor ID</Label>
            <Input id="providerId" {...register('providerId')} />
            {errors.providerId && (
              <p className="text-destructive text-sm">
                {errors.providerId.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="startTime">Başlangıç</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register('startTime', { valueAsDate: true })}
            />
            {errors.startTime && (
              <p className="text-destructive text-sm">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="duration">Süre (dakika)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              {...register('duration', { valueAsNumber: true })}
            />
            {errors.duration && (
              <p className="text-destructive text-sm">
                {errors.duration.message}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
