export interface CreateMetaAdAccountProps {
  id: string;
  clinicId: string;
  adAccountId: string;
  accessToken: string;
  tokenExpiresAt?: Date | null;
  pageId?: string;
  businessName?: string;
}
