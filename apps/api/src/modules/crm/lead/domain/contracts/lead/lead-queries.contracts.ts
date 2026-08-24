import { LeadStatusType as LeadStatus } from '@input-type-schemas/LeadStatusSchema';
import { LeadSourceType as LeadSource } from '@input-type-schemas/LeadSourceSchema';
import { Pagination } from '@shared/common';

export interface FindLeadsFilter {
  clinicId: string;
  status?: LeadStatus;
  source?: LeadSource;
  assignedToId?: string;
  pagination: Pagination;
}

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

export interface FindAdAttributedLeadsFilter {
  clinicId: string;
  from: Date;
  to: Date;
}
