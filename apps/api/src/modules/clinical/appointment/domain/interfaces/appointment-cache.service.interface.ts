export const APPOINTMENT_CACHE_SERVICE = Symbol('IAppointmentCacheService');

declare module 'ioredis' {
  interface Redis {
    releaseSlotLock(key: string, holderId: string): Promise<number>;
    refreshSlotLock(
      key: string,
      holderId: string,
      ttlSeconds: string
    ): Promise<number>;
  }
}

// ----------------------------------------------------------------------
// Payload Types
// ----------------------------------------------------------------------

export interface AcquireSlotLockPayload {
  providerId: string;
  startTimeIso: string;
  holderId: string;
  ttlSeconds?: number;
}

export interface RefreshSlotLockPayload {
  providerId: string;
  startTimeIso: string;
  holderId: string;
  ttlSeconds?: number;
}

export interface ReleaseSlotLockPayload {
  providerId: string;
  startTimeIso: string;
  holderId: string;
}

// ----------------------------------------------------------------------
// Result Types
// ----------------------------------------------------------------------

export type SlotAcquireResult =
  | {
      status: 'acquired';
      lockedUntilIso: string;
      lockedUntilTimestamp: number;
    }
  | {
      status: 'locked';
    };

export type SlotRefreshResult =
  | {
      status: 'refreshed';
      lockedUntilIso: string;
      lockedUntilTimestamp: number;
    }
  | {
      status: 'expired_or_stolen';
    };

// ----------------------------------------------------------------------
// Contract Interfaces
// ----------------------------------------------------------------------

export interface ISlotLockOperations {
  /**
   * Slotu ilk defa kilitlemeyi dener veya eldeki kilidi tazeler (Idempotent Acquire).
   */
  acquire(payload: AcquireSlotLockPayload): Promise<SlotAcquireResult>;

  /**
   * Uzun süren akışlarda kilidi canlı tutmak için çağrılır.
   */
  refresh(payload: RefreshSlotLockPayload): Promise<SlotRefreshResult>;

  /**
   * Kilidi yalnız tutan holder (UUID sahibi) serbest bırakır.
   */
  release(payload: ReleaseSlotLockPayload): Promise<void>;
}

export interface IAppointmentCacheService {
  readonly slotLockTtlSeconds: number;
  readonly slotLock: ISlotLockOperations;
}

// ----------------------------------------------------------------------
// Injection Token
// ----------------------------------------------------------------------
