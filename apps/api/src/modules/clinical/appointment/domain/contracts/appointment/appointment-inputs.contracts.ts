import { z } from 'zod';
import { AppointmentSchema, TimeZoneSchema } from '@shared';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { VisitTypeType as VisitType } from '@input-type-schemas/VisitTypeSchema';

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .extend({
    id: z.uuid().optional(),
    providerId: z.uuid(),
    clinicId: z.uuid(),
    patientId: z.uuid(),
    startTime: z.date(),
    endTime: z.date().optional(),
    patientName: z.string(),
    patientPhone: z.string(),
    patientEmail: z.email().nullable().optional(),
    duration: z.number().optional(),
    timezone: TimeZoneSchema,
    treatmentType: z.string().nullable().optional(),
    isConsultation: z.boolean(),
  });

export type CreateAppointmentProps = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentDetailsPropsSchema = z.object({
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email().nullable().optional(),
  notes: z.string().nullable().optional(),
  treatmentType: z.string().nullable().optional(),
  treatmentId: z.uuid().nullable().optional(),
});

export type UpdateAppointmentDetailsProps = {
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string | null;
  notes?: string | null;
  treatmentType?: string | null;
  treatmentId?: string | null;
  examinationType?: ExaminationType | null;
  visitType?: VisitType | null;
};

export const RescheduleRequestSchema = z
  .object({
    startTime: z.date(),
    endTime: z.date(),
    providerId: z.uuid('Provider ID geçerli bir UUID olmalıdır'),
    notes: z.string().max(1000, 'Notlar 1000 karakteri geçemez').optional(),
    treatmentId: z.uuid().nullable().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Bitiş zamanı, başlangıç zamanından sonra olmalıdır',
    path: ['endTime'],
  });

export type RescheduleRequestProps = z.infer<typeof RescheduleRequestSchema>;

export type RescheduleAppointmentProps = {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string;
};

export type RescheduleByPatientProps = RescheduleAppointmentProps & {
  rescheduleLimitHours: number;
};

export const CreateCancellationPropsSchema = z.object({
  canceledBy: z.uuid().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export type CreateCancellationProps = z.infer<
  typeof CreateCancellationPropsSchema
>;

export const CancelScheduleSchema = z.object({
  canceledBy: z.string(),
  reason: z.string().optional(),
});

export type CancelScheduleProps = z.infer<typeof CancelScheduleSchema>;

export interface CancelAppointmentProps {
  canceledBy: NonNullable<string>;
  cancelReason?: string;
}

export const CalculateEndTimeSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date().nullable().optional(),
    duration: z.coerce
      .number()
      .positive("Süre 0'dan büyük olmalıdır.")
      .int('Süre tam sayı olmalıdır.')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'Bitiş tarihi, başlangıç tarihinden önce veya eşit olamaz.',
      path: ['endTime'],
    }
  );

export type CalculateEndTimeProps = z.infer<typeof CalculateEndTimeSchema>;

export const AppointmentRuleSnapshotSchema = z.object({
  id: z.uuid(),
  status: AppointmentStatusSchema,
});

export type AppointmentRuleSnapshot = z.infer<
  typeof AppointmentRuleSnapshotSchema
>;

export type IAppointmentEntity = z.infer<typeof AppointmentSchema>;
