import { z } from 'zod';
import { LeadSourceSchema } from '@input-type-schemas/LeadSourceSchema';
import { LeadMediumSchema } from '@input-type-schemas/LeadMediumSchema';
import { LeadStatusSchema } from '@input-type-schemas/LeadStatusSchema';
import { PipelineStageTypeSchema } from '@input-type-schemas/PipelineStageTypeSchema';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { Pagination } from '@shared/common';
import { ActorContext } from '@common/interfaces';

// ==========================================
// 1. LEAD OLUŞTURMA SÖZLEŞMESİ (CREATE LEAD)
// ==========================================

export const CreateLeadSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  source: LeadSourceSchema,
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.email('Geçersiz e-posta formatı').optional(),
  notes: z.string().optional(),
  assignedToId: z.uuid().optional(),
  whatsAppConversationId: z.string().optional(),

  // Satış hunisi başlangıç pozisyonu (opsiyonel; handler varsayılan huniye atayabilir).
  pipelineId: z.uuid().optional(),
  stageId: z.uuid().optional(),

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

// ==========================================
// REKLAM ROI — reklam-atıflı dönüşen lead read-model'i
// ==========================================

/** Reklam kampanyasına atfedilen, hastaya dönüşmüş lead (ROI gelir eşleştirmesi için). */
export interface AdAttributedLead {
  campaignId: string;
  campaignName: string | null;
  adId: string | null;
  patientId: string;
  createdAt: Date;
}

export const FindAdAttributedLeadsFilterSchema = z.object({
  clinicId: z.uuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});
export type FindAdAttributedLeadsFilter = z.infer<
  typeof FindAdAttributedLeadsFilterSchema
>;

export const ConvertLeadSchema = z.object({
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  actor: z.custom<ActorContext>(
    (val) => val !== null && typeof val === 'object'
  ),
});

export type ConvertLeadProps = z.infer<typeof ConvertLeadSchema>;

// ==========================================
// SATIŞ HUNİSİ — aşama taşıma (Kanban board)
// ==========================================

/**
 * Lead'i hedef aşamaya taşır. `stageType` (OPEN/WON/LOST) coarse LeadStatus'ü
 * senkronlar: WON→CONVERTED, LOST→LOST, terminalden OPEN'a→yeniden aktif (QUALIFIED).
 */
export const MoveLeadToStageSchema = z.object({
  pipelineId: z.uuid(),
  stageId: z.uuid(),
  stageType: PipelineStageTypeSchema,
  reason: z.string().optional(),
});

export type MoveLeadToStageProps = z.infer<typeof MoveLeadToStageSchema>;

/** Yalnız huni + aşama kimliğini atar; LeadStatus'e dokunmaz (convert/lost senkronu). */
export const AssignLeadStageSchema = z.object({
  pipelineId: z.uuid(),
  stageId: z.uuid(),
});

export type AssignLeadStageProps = z.infer<typeof AssignLeadStageSchema>;
