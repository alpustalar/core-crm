import { USER_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';

export interface UserCapabilityChangedEventPayload {
  targetUserId: string;
  capability: string;
  actorId: string;
  source?: LogSource;
  reason?: string;
}

/**
 * Yetki devri güvenlik olayıdır: kimin kime hangi yetkiyi verdiği (ve geri
 * aldığı) denetim kaydına düşer. `LogType.SECURITY` seçilmesi bilinçlidir —
 * bu kayıtlar sıradan güncelleme logları arasında kaybolmamalı.
 */
export class UserCapabilityGrantedEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.CAPABILITY_GRANTED;

  public readonly targetUserId: string;
  public readonly capability: string;

  constructor(payload: UserCapabilityChangedEventPayload) {
    super({
      action: LogAction.USER_CAPABILITY_GRANTED,
      type: LogType.SECURITY,
      actorId: payload.actorId,
      source: payload.source ?? LogSource.WEB,
      details: {
        targetUserId: payload.targetUserId,
        capability: payload.capability,
        reason: payload.reason ?? null,
        description: `Kullanıcıya "${payload.capability}" yetkisi verildi.`,
      },
    });

    this.targetUserId = payload.targetUserId;
    this.capability = payload.capability;
  }
}

export class UserCapabilityRevokedEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.CAPABILITY_REVOKED;

  public readonly targetUserId: string;
  public readonly capability: string;

  constructor(payload: UserCapabilityChangedEventPayload) {
    super({
      action: LogAction.USER_CAPABILITY_REVOKED,
      type: LogType.SECURITY,
      actorId: payload.actorId,
      source: payload.source ?? LogSource.WEB,
      details: {
        targetUserId: payload.targetUserId,
        capability: payload.capability,
        description: `Kullanıcının "${payload.capability}" yetkisi kaldırıldı.`,
      },
    });

    this.targetUserId = payload.targetUserId;
    this.capability = payload.capability;
  }
}
