export interface CreateMetaLeadProps {
  id: string;
  metaAdAccountId: string;
  metaLeadId: string;
  formId?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  adsetId?: string | null;
  adId?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  rawData?: Record<string, unknown> | null;
}
