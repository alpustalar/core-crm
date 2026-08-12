'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { CreateLeadSchema, type CreateLead } from '@core-crm/shared/client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/lib/api';

import { useCreateLead } from '../api/use-lead-mutations';
import { LEAD_SOURCE_LABELS } from '../lead.labels';

/**
 * Form şeması `shared`taki `CreateLeadSchema`nın **kendisi** — kopyası değil.
 * Faz 2'nin en büyük kazancı bu: doğrulama kuralı tek yerde yaşıyor, backend
 * de aynı şemayla doğruluyor, ikisi ayrışamaz.
 */
export function CreateLeadDialog({ clinicId }: { clinicId: string }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const createLead = useCreateLead(clinicId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateLead>({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: { source: 'MANUAL' },
  });

  // `watch()` yerine `useWatch`: ilki her render'da yeni bir fonksiyon döndürdüğü
  // için React Compiler bileşeni memoize etmekten vazgeçiyor.
  const source = useWatch({ control, name: 'source' });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await createLead.mutateAsync(values);
      reset({ source: 'MANUAL' });
      setOpen(false);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Kayıt oluşturulamadı. Tekrar dene.'
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Yeni lead
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni lead</DialogTitle>
          <DialogDescription>
            En az bir iletişim bilgisi girmen önerilir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="source">Kaynak</Label>
            <Select
              value={source}
              onValueChange={(value) =>
                setValue('source', value as CreateLead['source'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Ad</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" inputMode="tel" {...register('phone')} />
            {errors.phone && (
              <p className="text-destructive text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Not</Label>
            <Input id="notes" {...register('notes')} />
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
