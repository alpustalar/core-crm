// src/domain/common/execution/interfaces/audit-log.interface.ts

import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

export interface IAuditLog {
  action: LogAction; // Hangi işlem? (CLINIC_CREATE, APPOINTMENT_CANCEL)
  source?: LogSource; // İşlem nereden tetiklendi? (WEB, MOBILE, SYSTEM)
  type: LogType; // Logun seviyesi (INFO, WARNING, CRITICAL)
  actorId?: string; // İşlemi yapan Actor (Senin kararınla actorId ile eşleşiyor)
  details?: unknown; // İşleme ait teknik/işsel detaylar (JSON)
  metadata?: Record<string, any>; // Opsiyonel: IP, UserAgent gibi ek veriler
}
