import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IWhatsappCloudApi,
  UpdateWhatsappBusinessProfileInput,
  WHATSAPP_CLOUD_API_CONFIG,
  WhatsappBusinessProfile,
  WhatsappCloudApiConfig,
  WhatsappMediaContent,
  WhatsappPhoneNumberHealth,
  WhatsappTemplateSummary,
  WhatsappTokenResult,
} from '@modules/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import {
  WHATSAPP_GRAPH_API_BASE,
  WHATSAPP_SEND_TIMEOUT_MS,
} from '@modules/conversation/infrastructure/adapters/meta/whatsapp-graph.constants';

import { createBearerToken } from '@common/utils';

/**
 * WhatsApp Cloud API (Meta Graph) onboarding çağrıları. Embedded Signup'tan dönen yetki
 * kodunu platform app credential'larıyla token'a çevirir ve WABA'yı app webhook'una
 * abone eder. App-seviyesi credential'lar env'den (WHATSAPP_APP_ID/SECRET).
 */
@Injectable()
export class WhatsappCloudApiService implements IWhatsappCloudApi {
  private readonly logger = new Logger(WhatsappCloudApiService.name);

  constructor(
    @Inject(WHATSAPP_CLOUD_API_CONFIG)
    private readonly whatsappCloudApiConfig: WhatsappCloudApiConfig
  ) {}

  async exchangeCodeForToken(code: string): Promise<WhatsappTokenResult> {
    const { appSecret, appId } = this.whatsappCloudApiConfig;

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
    });
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/oauth/access_token?${params}`,
      { signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS) }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WhatsApp token exchange hatası: ${res.status} ${err}`);
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in?: number;
    };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000)
        : null,
    };
  }

  async exchangeForLongLivedToken(
    shortLivedToken: string
  ): Promise<WhatsappTokenResult> {
    const { appSecret, appId } = this.whatsappCloudApiConfig;

    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/oauth/access_token?${params}`,
      { signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS) }
    );
    if (!res.ok) {
      const err = await res.text();
      // Uzun-ömürlüye çeviremezsek kısa-ömürlüyle devam edilebilir; çağıran karar verir.
      throw new Error(
        `WhatsApp uzun-ömürlü token hatası: ${res.status} ${err}`
      );
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in?: number;
    };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000)
        : null,
    };
  }

  async subscribeAppToWaba(wabaId: string, accessToken: string): Promise<void> {
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/${wabaId}/subscribed_apps`,
      {
        method: 'POST',
        headers: { Authorization: createBearerToken(accessToken) },
        signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      // Abonelik kritik ama onboarding'i tümden bloklamamak için loglanır + fırlatılır.
      this.logger.error(`WABA webhook aboneliği hatası: ${res.status} ${err}`);
      throw new Error(`WABA webhook aboneliği başarısız: ${res.status}`);
    }
  }

  async listMessageTemplates(
    wabaId: string,
    accessToken: string
  ): Promise<WhatsappTemplateSummary[]> {
    const params = new URLSearchParams({
      fields: 'name,language,status,category,components',
      limit: '200',
    });
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/${wabaId}/message_templates?${params}`,
      {
        headers: { Authorization: createBearerToken(accessToken) },
        signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Şablon listeleme hatası: ${res.status} ${err}`);
      throw new Error(`Şablon listeleme başarısız: ${res.status}`);
    }
    const json = (await res.json()) as { data?: WhatsappTemplateSummary[] };
    return json.data ?? [];
  }

  async getPhoneNumberHealth(
    phoneNumberId: string,
    accessToken: string
  ): Promise<WhatsappPhoneNumberHealth> {
    const params = new URLSearchParams({
      fields:
        'verified_name,display_phone_number,quality_rating,messaging_limit_tier,name_status,code_verification_status',
    });
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/${phoneNumberId}?${params}`,
      {
        headers: { Authorization: createBearerToken(accessToken) },
        signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Numara sağlık sorgusu hatası: ${res.status} ${err}`);
    }
    const json = (await res.json()) as Record<string, string | undefined>;
    return {
      displayPhoneNumber: json.display_phone_number ?? null,
      verifiedName: json.verified_name ?? null,
      qualityRating: json.quality_rating ?? null,
      messagingTier: json.messaging_limit_tier ?? null,
      nameStatus: json.name_status ?? null,
      codeVerificationStatus: json.code_verification_status ?? null,
    };
  }

  async getBusinessProfile(
    phoneNumberId: string,
    accessToken: string
  ): Promise<WhatsappBusinessProfile> {
    const params = new URLSearchParams({
      fields:
        'about,address,description,email,profile_picture_url,websites,vertical',
    });
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/${phoneNumberId}/whatsapp_business_profile?${params}`,
      {
        headers: { Authorization: createBearerToken(accessToken) },
        signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`İşletme profili sorgusu hatası: ${res.status} ${err}`);
    }
    // Cloud API profili `data: [ {...} ]` zarfında döner.
    const json = (await res.json()) as {
      data?: Array<Record<string, unknown>>;
    };
    const p = json.data?.[0] ?? {};
    return {
      about: (p.about as string) ?? null,
      address: (p.address as string) ?? null,
      description: (p.description as string) ?? null,
      email: (p.email as string) ?? null,
      vertical: (p.vertical as string) ?? null,
      websites: (p.websites as string[]) ?? [],
      profilePictureUrl: (p.profile_picture_url as string) ?? null,
    };
  }

  async updateBusinessProfile(
    phoneNumberId: string,
    accessToken: string,
    input: UpdateWhatsappBusinessProfileInput
  ): Promise<void> {
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/${phoneNumberId}/whatsapp_business_profile`,
      {
        method: 'POST',
        headers: {
          Authorization: createBearerToken(accessToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...input }),
        signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(
        `İşletme profili güncelleme hatası: ${res.status} ${err}`
      );
      throw new Error(`İşletme profili güncellenemedi: ${res.status}`);
    }
  }

  async registerPhoneNumber(
    phoneNumberId: string,
    pin: string,
    accessToken: string
  ): Promise<void> {
    const res = await fetch(
      `${WHATSAPP_GRAPH_API_BASE}/${phoneNumberId}/register`,
      {
        method: 'POST',
        headers: {
          Authorization: createBearerToken(accessToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', pin }),
        signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      // Register kritik: yapılmazsa gönderim 401/470 olur. Onboarding'i durdur.
      this.logger.error(`Numara register hatası: ${res.status} ${err}`);
      throw new Error(`Numara Cloud API register başarısız: ${res.status}`);
    }
  }

  async fetchMedia(
    mediaId: string,
    accessToken: string
  ): Promise<WhatsappMediaContent | null> {
    const authHeader = { Authorization: createBearerToken(accessToken) };

    // 1) media id → geçici indirme URL'i + mime.
    const metaRes = await fetch(`${WHATSAPP_GRAPH_API_BASE}/${mediaId}`, {
      headers: authHeader,
      signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
    });
    if (!metaRes.ok) {
      this.logger.warn(`Medya meta alınamadı: ${mediaId} (${metaRes.status})`);
      return null;
    }
    const meta = (await metaRes.json()) as { url?: string; mime_type?: string };
    if (!meta.url) return null;

    // 2) geçici URL → token'lı indirme (lookaside URL Bearer ister).
    const fileRes = await fetch(meta.url, {
      headers: authHeader,
      signal: AbortSignal.timeout(WHATSAPP_SEND_TIMEOUT_MS),
    });
    if (!fileRes.ok) {
      this.logger.warn(`Medya indirilemedi: ${mediaId} (${fileRes.status})`);
      return null;
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    return {
      content: Buffer.from(arrayBuffer),
      mimeType:
        meta.mime_type ??
        fileRes.headers.get('content-type') ??
        'application/octet-stream',
    };
  }
}
