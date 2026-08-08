export const META_MARKETING_API_SERVICE = Symbol('IMetaMarketingApiService');

export interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  clicks: string;
  impressions: string;
  cpc?: string;
  ctr?: string;
  date_start: string;
  date_stop: string;
}

export interface MetaLeadField {
  name: string;
  values: string[];
}

export interface MetaLeadData {
  id: string;
  created_time: string;
  field_data: MetaLeadField[];
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;
  form_id?: string;
}

export interface MetaAdAccountInfo {
  id: string;
  name: string;
  account_id: string;
}

export interface MetaPageInfo {
  id: string;
  name: string;
}

export interface MetaTokenResult {
  accessToken: string;
  expiresAt: Date | null;
}

export interface IMetaMarketingApiService {
  getCampaignInsights(
    adAccountId: string,
    accessToken: string,
    dateFrom: string,
    dateTo: string
  ): Promise<MetaCampaignInsight[]>;

  getLeadData(
    leadId: string,
    accessToken: string
  ): Promise<MetaLeadData | null>;

  buildOAuthUrl(appId: string, redirectUri: string, state: string): string;

  exchangeCodeForToken(
    code: string,
    appId: string,
    appSecret: string,
    redirectUri: string
  ): Promise<MetaTokenResult>;

  extendToLongLivedToken(
    shortLivedToken: string,
    appId: string,
    appSecret: string
  ): Promise<MetaTokenResult>;

  getAdAccounts(accessToken: string): Promise<MetaAdAccountInfo[]>;

  getPages(accessToken: string): Promise<MetaPageInfo[]>;

  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    appSecret: string
  ): boolean;
}
