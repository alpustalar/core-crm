import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';
import { LeadMediumType as LeadMedium } from '@input-type-schemas/LeadMediumSchema';
import { LeadStatusType as LeadStatus } from '@input-type-schemas/LeadStatusSchema';

const { INTERNAL, MANAGEMENT, DATA_OWNER, ADMIN } = ResponseGroups;

export class LeadResponseDto {
  @Expose() id: string;
  @Expose() clinicId: string;

  // --- Temel Aday Bilgileri (Herkese Açık / Ortak CRM Görünümü) ---
  @Expose() source: LeadSource;
  @Expose() status: LeadStatus;
  @Expose() name: string | null;

  // --- İletişim Verileri (Adayın Kendisi, CRM Personeli, Yönetim ve Admin) ---
  @Expose({ groups: [DATA_OWNER, INTERNAL, MANAGEMENT, ADMIN] })
  phone: string | null;

  @Expose({ groups: [DATA_OWNER, INTERNAL, MANAGEMENT, ADMIN] })
  email: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  notes: string | null;

  // --- CRM Operasyonel Atama ve Dönüşüm Bilgileri ---
  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  assignedToId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  patientId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  appointmentId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  @Type(() => Date)
  convertedAt: Date | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  lostReason: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  @Type(() => Date)
  lostAt: Date | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  whatsAppConversationId: string | null;

  // --- Pazarlama & Meta Reklam İzleme Verileri (Sadece Yönetim ve Admin) ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  medium: LeadMedium | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  metaLeadId: string | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  campaignId: string | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  campaignName: string | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  adId: string | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  adsetId: string | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  ctwaClid: string | null; // Click to WhatsApp ID

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  sourceUrl: string | null;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
