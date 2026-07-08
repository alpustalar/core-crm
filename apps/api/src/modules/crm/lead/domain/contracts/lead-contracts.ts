import { z } from 'zod';
import { LeadSourceSchema } from '@input-type-schemas/LeadSourceSchema';
import { LeadMediumSchema } from '@input-type-schemas/LeadMediumSchema';
import { LeadStatusSchema } from '@input-type-schemas/LeadStatusSchema';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { Pagination } from '@shared/common';
import { ActorContext } from '@common/interfaces';
import { ValidateOptionsType } from '@common/domain/constants/default-options.constant';

// ==========================================
// 1. LEAD OLUŞTURMA SÖZLEŞMESİ (CREATE LEAD)
// ==========================================

export const CreateLeadSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  source: LeadSourceSchema,
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.email('Geçersiz e-posta formatı').optional(),
  notes: z.string().optional(),
  assignedToId: z.uuid().optional(),
  whatsAppConversationId: z.string().optional(),

  // Attribution — reklam/kaynak kökeni (CTWA referral veya Meta Lead Ads formu).
  medium: LeadMediumSchema.optional(),
  metaLeadId: z.string().optional(),
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  adId: z.string().optional(),
  adsetId: z.string().optional(),
  ctwaClid: z.string().optional(),
  sourceUrl: z.string().optional(),

  // Audit bağlamı — entity LeadCreatedEvent'i bu değerlerle raise eder (handler'dan geçer).
  actorId: z.string().optional(),
  logSource: z.nativeEnum(LogSource).optional(),
});

export type CreateLeadProps = z.infer<typeof CreateLeadSchema>;

export const FindLeadsFilterSchema = z.object({
  clinicId: z.uuid(),
  status: LeadStatusSchema.optional(),
  source: LeadSourceSchema.optional(),
  assignedToId: z.uuid().optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});

export type FindLeadsFilter = z.infer<typeof FindLeadsFilterSchema>;

export const MarkLostLeadSchema = z.object({
  reason: z.string().optional(),
  actor: z
    .custom<ActorContext>((val) => val !== null && typeof val === 'object')
    .optional(),
  validateOptions: z
    .custom<ValidateOptionsType>(
      (val) => val !== null && typeof val === 'object'
    )
    .optional(),
});

export type MarkLostLeadProps = z.infer<typeof MarkLostLeadSchema>;

export const ConvertLeadSchema = z.object({
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  validateOptions: z
    .custom<ValidateOptionsType>(
      (val) => val !== null && typeof val === 'object'
    )
    .optional(),
});

export type ConvertLeadProps = z.infer<typeof ConvertLeadSchema>;
