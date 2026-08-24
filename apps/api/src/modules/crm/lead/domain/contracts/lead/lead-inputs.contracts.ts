import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';
import { LeadMediumType as LeadMedium } from '@input-type-schemas/LeadMediumSchema';
import { PipelineStageTypeType as PipelineStageType } from '@input-type-schemas/PipelineStageTypeSchema';
import { LogSource } from '@src/domain/constants/log-action.constant';

export interface CreateLeadProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  source: LeadSource;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  assignedToId?: string;
  whatsAppConversationId?: string;

  // Satış hunisi başlangıç pozisyonu (opsiyonel; handler varsayılan huniye atayabilir).
  pipelineId?: string;
  stageId?: string;

  // Attribution — reklam/kaynak kökeni (CTWA referral veya Meta Lead Ads formu).
  medium?: LeadMedium;
  metaLeadId?: string;
  campaignId?: string;
  campaignName?: string;
  adId?: string;
  adsetId?: string;
  ctwaClid?: string;
  sourceUrl?: string;

  // Audit bağlamı — entity LeadCreatedEvent'i bu değerlerle raise eder (handler'dan geçer).
  actorId?: string;
  logSource?: LogSource;
}

/**
 * Durum değişikliği event'lerinin audit alanları. Entity event'i kendisi raise
 * ettiği için (bkz. CLAUDE.md — event entity'de raise edilir) "kim/nereden"
 * bilgisi entity'ye buradan taşınır. Tüm `ActorContext`'i domain'e sokmak yerine
 * yalnız iki skaler geçilir: entity'nin yetki/rol bilgisine işi yok.
 */
export interface LeadAuditProps {
  actorId: string;
  logSource: LogSource;
}

export interface ConvertLeadProps {
  patientId?: string;
  appointmentId?: string;
  actorId: string;
  logSource: LogSource;
}

export interface MarkLeadLostProps {
  reason?: string;
  actorId: string;
  logSource: LogSource;
}

/**
 * Lead'i hedef aşamaya taşır. `stageType` (OPEN/WON/LOST) coarse LeadStatus'ü
 * senkronlar: WON→CONVERTED, LOST→LOST, terminalden OPEN'a→yeniden aktif (QUALIFIED).
 */
export interface MoveLeadToStageProps {
  pipelineId: string;
  stageId: string;
  stageType: PipelineStageType;
  /** Audit metnindeki aşama adı ("Lead aşama taşındı (Teklif): ..."). */
  stageName: string;
  reason?: string;
  actorId: string;
  logSource: LogSource;
}

/** Yalnız huni + aşama kimliğini atar; LeadStatus'e dokunmaz (convert/lost senkronu). */
export interface AssignLeadStageProps {
  pipelineId: string;
  stageId: string;
}
