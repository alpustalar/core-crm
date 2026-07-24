import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IInstagramGraphApi,
  INSTAGRAM_GRAPH_API_CONFIG,
  InstagramGraphApiConfig,
  InstagramTokenResult,
} from '@modules/messaging/channel-config/domain/interfaces/instagram-graph-api.interface';
import {
  INSTAGRAM_GRAPH_API_BASE,
  INSTAGRAM_SEND_TIMEOUT_MS,
} from '@modules/messaging/conversation/infrastructure/adapters/instagram/instagram-graph.constants';

/**
 * Instagram (Meta Graph) onboarding çağrıları. Facebook/Instagram Login yetki kodunu platform
 * app credential'larıyla token'a çevirir ve hesabı app webhook'una (messages) abone eder.
 * App-seviyesi credential'lar env'den (INSTAGRAM_APP_ID/SECRET).
 */
@Injectable()
export class InstagramGraphApiService implements IInstagramGraphApi {
  private readonly logger = new Logger(InstagramGraphApiService.name);

  constructor(
    @Inject(INSTAGRAM_GRAPH_API_CONFIG)
    private readonly instagramGraphApiConfig: InstagramGraphApiConfig
  ) {}

  async exchangeCodeForToken(code: string): Promise<InstagramTokenResult> {
    const { appId, appSecret } = this.instagramGraphApiConfig;

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
    });
    const res = await fetch(
      `${INSTAGRAM_GRAPH_API_BASE}/oauth/access_token?${params}`,
      { signal: AbortSignal.timeout(INSTAGRAM_SEND_TIMEOUT_MS) }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Instagram token exchange hatası: ${res.status} ${err}`);
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
  ): Promise<InstagramTokenResult> {
    const { appId, appSecret } = this.instagramGraphApiConfig;

    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });
    const res = await fetch(
      `${INSTAGRAM_GRAPH_API_BASE}/oauth/access_token?${params}`,
      { signal: AbortSignal.timeout(INSTAGRAM_SEND_TIMEOUT_MS) }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(
        `Instagram uzun-ömürlü token hatası: ${res.status} ${err}`
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

  async subscribeToWebhooks(
    igUserId: string,
    accessToken: string
  ): Promise<void> {
    const params = new URLSearchParams({ subscribed_fields: 'messages' });
    const res = await fetch(
      `${INSTAGRAM_GRAPH_API_BASE}/${igUserId}/subscribed_apps?${params}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(INSTAGRAM_SEND_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`IG webhook aboneliği hatası: ${res.status} ${err}`);
      throw new Error(`Instagram webhook aboneliği başarısız: ${res.status}`);
    }
  }
}
