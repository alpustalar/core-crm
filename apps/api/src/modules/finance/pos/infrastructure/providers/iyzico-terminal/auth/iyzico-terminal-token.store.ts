import { Injectable } from '@nestjs/common';
import { IYZICO_TERMINAL_TOKEN_REFRESH_THRESHOLD_MS } from '../iyzico-terminal.constants';
import type { IyzicoTerminalCachedToken } from './iyzico-terminal-auth.types';

@Injectable()
export class IyzicoTerminalTokenStore {
  private readonly store = new Map<string, IyzicoTerminalCachedToken>();

  get(clientId: string): IyzicoTerminalCachedToken | undefined {
    return this.store.get(clientId);
  }

  set(clientId: string, token: IyzicoTerminalCachedToken): void {
    this.store.set(clientId, token);
  }

  isExpiringSoon(token: IyzicoTerminalCachedToken): boolean {
    return Date.now() >= token.expiresAt - IYZICO_TERMINAL_TOKEN_REFRESH_THRESHOLD_MS;
  }

  delete(clientId: string): void {
    this.store.delete(clientId);
  }
}
