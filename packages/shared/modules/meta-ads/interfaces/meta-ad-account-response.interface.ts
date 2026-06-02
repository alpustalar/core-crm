export interface MetaAdAccountResponse {
  id: string;
  clinicId: string;
  adAccountId: string;
  businessName: string | null;
  isActive: boolean;
  lastSyncAt: Date | null;
  connectedAt: Date;
}
