import { USER_EVENTS } from '@src/domain/constants/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { BaseEvent } from '@common/interfaces';

export interface UserScopeChangedEventPayload {
  targetUserId: string;
  actorId: string;
  /** İşlem sonrası TAM liste. */
  assigned: string[];
  /** Bu işlemle eklenenler. */
  added: string[];
  /** Bu işlemle kaldırılanlar. */
  removed: string[];
  source?: LogSource;
}

/**
 * Kapsam devri güvenlik olayıdır, sıradan bir profil güncellemesi değil:
 * kullanıcıyı bir kliniğin YÖNETİCİSİ yapmak, o kliniğin tüm verisine ve
 * personeline erişim açar. Bu yüzden `LogType.SECURITY` ile ayrı bir denetim
 * kanalına düşer ve önce/sonra farkı (`added` / `removed`) kayda geçer —
 * denetimde "kim, kime, neyi verdi" tek satırdan okunabilsin.
 */
export class UserManagedClinicsAssignedEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.MANAGED_CLINICS_ASSIGNED;

  public readonly targetUserId: string;
  public readonly assigned: string[];

  constructor(payload: UserScopeChangedEventPayload) {
    super({
      action: LogAction.USER_MANAGED_CLINICS_ASSIGNED,
      type: LogType.SECURITY,
      actorId: payload.actorId,
      source: payload.source ?? LogSource.WEB,
      details: {
        targetUserId: payload.targetUserId,
        assigned: payload.assigned,
        added: payload.added,
        removed: payload.removed,
        description: `Kullanıcının yönettiği klinikler güncellendi (+${payload.added.length} / -${payload.removed.length}).`,
      },
    });

    this.targetUserId = payload.targetUserId;
    this.assigned = payload.assigned;
  }
}

/**
 * Organizasyon sahipliği sistemdeki en geniş kapsamdır: sahibin altındaki tüm
 * klinikleri kapsar. Klinik atamasından ayrı bir olay olarak tutulur ki denetim
 * kaydında ikisi aynı torbaya girmesin.
 */
export class UserOrganizationOwnershipGrantedEvent extends BaseEvent {
  static readonly NAME = USER_EVENTS.ORGANIZATION_OWNERSHIP_GRANTED;

  public readonly targetUserId: string;
  public readonly assigned: string[];

  constructor(payload: UserScopeChangedEventPayload) {
    super({
      action: LogAction.USER_ORGANIZATION_OWNERSHIP_GRANTED,
      type: LogType.SECURITY,
      actorId: payload.actorId,
      source: payload.source ?? LogSource.WEB,
      details: {
        targetUserId: payload.targetUserId,
        assigned: payload.assigned,
        added: payload.added,
        removed: payload.removed,
        description: `Kullanıcının organizasyon sahipliği güncellendi (+${payload.added.length} / -${payload.removed.length}).`,
      },
    });

    this.targetUserId = payload.targetUserId;
    this.assigned = payload.assigned;
  }
}
