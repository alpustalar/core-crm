import { defineEndpoint } from '@shared/common/contracts/endpoint';
import type { ActorContextResponse, UserResponse } from '../interfaces';

/**
 * `apps/api` → `MeController` (`@Controller('me')`, sürüm 1).
 * Yollar taban adrese (`.../api/v1`) göreli yazılır.
 */
export const meEndpoints = {
  /** Aktörün yetki sınırları — girişte bir kez çekilir, `staleTime: Infinity`. */
  context: defineEndpoint<ActorContextResponse>()({
    method: 'GET',
    path: '/me/context',
  }),

  profile: defineEndpoint<UserResponse>()({
    method: 'GET',
    path: '/me',
  }),
} as const;
