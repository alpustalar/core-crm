import type { LeadSourceType } from '@shared/generated-zod/inputTypeSchemas/LeadSourceSchema';
import type { LeadStatusType } from '@shared/generated-zod/inputTypeSchemas/LeadStatusSchema';
import type { LeadMediumType } from '@shared/generated-zod/inputTypeSchemas/LeadMediumSchema';

/**
 * Enum'lar üretilmiş tiplerden alınır; elle yazıldıklarında bayatlıyorlardı
 * (`source` yalnız iki kanalı tanıyordu, oysa sekiz kanal var).
 */
export interface LeadResponse {
  id: string;
  clinicId: string;
  source: LeadSourceType;
  status: LeadStatusType;
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  assignedToId: string | null;
  patientId: string | null;
  appointmentId: string | null;
  convertedAt: Date | null;
  lostReason: string | null;
  lostAt: Date | null;
  whatsAppConversationId: string | null;

  // Attribution — reklam/kaynak kökeni.
  medium: LeadMediumType | null;
  campaignId: string | null;
  campaignName: string | null;

  createdAt: Date;
  updatedAt: Date;
}
