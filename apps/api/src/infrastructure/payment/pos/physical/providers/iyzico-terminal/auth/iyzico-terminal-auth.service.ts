import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import {
  IYZICO_TERMINAL_PATHS,
  IYZICO_TERMINAL_PROD_BASE_URL,
} from '../iyzico-terminal.constants';
import {
  IyzicoTerminalAuthError,
  IyzicoTerminalTokenRefreshError,
} from '../iyzico-terminal.errors';
import { IyzicoTerminalTokenStore } from './iyzico-terminal-token.store';
import type {
  IyzicoTerminalAuthCodeResponse,
  IyzicoTerminalCachedToken,
  IyzicoTerminalCredentials,
  IyzicoTerminalTokenResponse,
} from './iyzico-terminal-auth.types';

@Injectable()
export class IyzicoTerminalAuthService {
  private readonly logger = new Logger(IyzicoTerminalAuthService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly tokenStore: IyzicoTerminalTokenStore,
    private readonly config: ConfigService
  ) {
    this.baseUrl =
      this.config.get<string>(ENV.IYZICO_TERMINAL_BASE_URL) ??
      IYZICO_TERMINAL_PROD_BASE_URL;
  }

  /**
   * Geçerli bir access token döner.
   * Önce cache kontrol edilir; yakında dolacaksa refresh denenir,
   * başarısız olursa veya cache yoksa tam login akışı çalışır.
   */
  async getAccessToken(
    credentials: IyzicoTerminalCredentials
  ): Promise<string> {
    const cached = this.tokenStore.get(credentials.clientId);

    if (cached && !this.tokenStore.isExpiringSoon(cached)) {
      return cached.accessToken;
    }

    if (cached?.refreshToken) {
      try {
        const refreshed = await this.refresh(credentials, cached.refreshToken);
        return refreshed.accessToken;
      } catch (err) {
        this.logger.warn(
          `iyzico terminal token refresh başarısız, yeniden login yapılıyor: ${(err as Error).message}`
        );
        this.tokenStore.delete(credentials.clientId);
      }
    }

    const token = await this.login(credentials);
    return token.accessToken;
  }

  /** Önbelleği temizler; bir sonraki getAccessToken çağrısı tam login yapar. */
  invalidateToken(clientId: string): void {
    this.tokenStore.delete(clientId);
  }

  // ---------------------------------------------------------------------------
  // private
  // ---------------------------------------------------------------------------

  private async login(
    credentials: IyzicoTerminalCredentials
  ): Promise<IyzicoTerminalCachedToken> {
    const code = await this.getAuthCode(credentials);
    const tokenResponse = await this.exchangeCode(credentials, code);
    return this.cacheToken(credentials.clientId, tokenResponse);
  }

  private async getAuthCode(
    credentials: IyzicoTerminalCredentials
  ): Promise<string> {
    const params = new URLSearchParams({
      scope: 'iyzipayApiGateway',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      response_type: 'code',
      username: credentials.username,
      password: credentials.password,
      request_timestamp: Date.now().toString(),
    });

    const url = `${this.baseUrl}${IYZICO_TERMINAL_PATHS.AUTHORIZE}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new IyzicoTerminalAuthError(
        `iyzico terminal authorize başarısız: ${res.status}`,
        res.status,
        body
      );
    }

    const data = (await res.json()) as IyzicoTerminalAuthCodeResponse;
    this.logger.debug(
      `iyzico terminal auth code alındı — clientId=${credentials.clientId}`
    );
    return data.code;
  }

  private async exchangeCode(
    credentials: IyzicoTerminalCredentials,
    code: string
  ): Promise<IyzicoTerminalTokenResponse> {
    return this.callTokenEndpoint(credentials, {
      grant_type: 'authorization_code',
      code,
    });
  }

  private async refresh(
    credentials: IyzicoTerminalCredentials,
    refreshToken: string
  ): Promise<IyzicoTerminalCachedToken> {
    const tokenResponse = await this.callTokenEndpoint(credentials, {
      grant_type: 'refresh_token',
      token: refreshToken,
    });
    return this.cacheToken(credentials.clientId, tokenResponse);
  }

  private async callTokenEndpoint(
    credentials: IyzicoTerminalCredentials,
    body: Record<string, string>
  ): Promise<IyzicoTerminalTokenResponse> {
    const basicAuth = Buffer.from(
      `${credentials.clientId}:${credentials.clientSecret}`
    ).toString('base64');

    const url = `${this.baseUrl}${IYZICO_TERMINAL_PATHS.TOKEN}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    });

    if (!res.ok) {
      const responseBody = await res.text();
      throw new IyzicoTerminalTokenRefreshError(
        `iyzico terminal token isteği başarısız: ${res.status} — ${responseBody}`
      );
    }

    return (await res.json()) as Promise<IyzicoTerminalTokenResponse>;
  }

  private cacheToken(
    clientId: string,
    response: IyzicoTerminalTokenResponse
  ): IyzicoTerminalCachedToken {
    const token: IyzicoTerminalCachedToken = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
    };
    this.tokenStore.set(clientId, token);
    this.logger.debug(
      `iyzico terminal token önbelleğe alındı — clientId=${clientId} expiresIn=${response.expires_in}s`
    );
    return token;
  }
}
