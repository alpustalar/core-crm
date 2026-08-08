import { Injectable, Logger } from '@nestjs/common';
import {
  IMetaMarketingApiService,
  MetaAdAccountInfo,
  MetaCampaignInsight,
  MetaLeadData,
  MetaPageInfo,
  MetaTokenResult,
} from '@modules/crm/meta-ads/domain/interfaces/meta-marketing-api.interface';
import { CryptoManager } from '@src/infrastructure/security/crypto/crypto.manager';

const META_API_BASE = 'https://graph.facebook.com/v20.0';
const META_OAUTH_BASE = 'https://www.facebook.com/v20.0/dialog/oauth';
const META_OAUTH_SCOPES =
  'ads_read,leads_retrieval,pages_show_list,pages_read_engagement';
const DEFAULT_FIELDS =
  'campaign_id,campaign_name,spend,clicks,impressions,cpc,ctr';

@Injectable()
export class MetaMarketingApiService implements IMetaMarketingApiService {
  private readonly logger = new Logger(MetaMarketingApiService.name);

  async getCampaignInsights(
    adAccountId: string,
    accessToken: string,
    dateFrom: string,
    dateTo: string
  ): Promise<MetaCampaignInsight[]> {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: DEFAULT_FIELDS,
      time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
      level: 'campaign',
      limit: '500',
    });

    const url = `${META_API_BASE}/${adAccountId}/insights?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta API hatası: ${res.status} ${err}`);
    }

    const json = (await res.json()) as { data: MetaCampaignInsight[] };
    return json.data ?? [];
  }

  async getLeadData(
    leadId: string,
    accessToken: string
  ): Promise<MetaLeadData | null> {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        fields: 'id,created_time,field_data,ad_id,adset_id,campaign_id,form_id',
      });

      const res = await fetch(`${META_API_BASE}/${leadId}?${params}`, {
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) return null;
      return (await res.json()) as MetaLeadData;
    } catch (err) {
      this.logger.warn(`Lead verisi alınamadı: ${leadId}`, err);
      return null;
    }
  }

  buildOAuthUrl(appId: string, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: META_OAUTH_SCOPES,
      response_type: 'code',
      state,
    });
    return `${META_OAUTH_BASE}?${params}`;
  }

  async exchangeCodeForToken(
    code: string,
    appId: string,
    appSecret: string,
    redirectUri: string
  ): Promise<MetaTokenResult> {
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });
    const res = await fetch(`${META_API_BASE}/oauth/access_token?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta token exchange hatası: ${res.status} ${err}`);
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in?: number;
    };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_in ? this.expiresInToDate(json.expires_in) : null,
    };
  }

  async extendToLongLivedToken(
    shortLivedToken: string,
    appId: string,
    appSecret: string
  ): Promise<MetaTokenResult> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });
    const res = await fetch(`${META_API_BASE}/oauth/access_token?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta token uzatma hatası: ${res.status} ${err}`);
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in?: number;
    };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_in ? this.expiresInToDate(json.expires_in) : null,
    };
  }

  async getAdAccounts(accessToken: string): Promise<MetaAdAccountInfo[]> {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,name,account_id',
      limit: '50',
    });
    const res = await fetch(`${META_API_BASE}/me/adaccounts?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: MetaAdAccountInfo[] };
    return json.data ?? [];
  }

  async getPages(accessToken: string): Promise<MetaPageInfo[]> {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,name',
      limit: '50',
    });
    const res = await fetch(`${META_API_BASE}/me/accounts?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: MetaPageInfo[] };
    return json.data ?? [];
  }

  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    appSecret: string
  ): boolean {
    return CryptoManager.verifyWebhookSignature(rawBody, signature, appSecret);
  }

  private expiresInToDate(expiresInSeconds: number): Date {
    return new Date(Date.now() + expiresInSeconds * 1000);
  }
}
