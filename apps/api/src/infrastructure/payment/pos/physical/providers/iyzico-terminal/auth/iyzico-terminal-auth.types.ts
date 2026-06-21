export interface IyzicoTerminalCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export interface IyzicoTerminalAuthCodeResponse {
  code: string;
  issuedAt: string;
  expiredAt: string;
}

export interface IyzicoTerminalTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface IyzicoTerminalCachedToken {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp ms — bu zamandan sonra token geçersiz */
  expiresAt: number;
}
