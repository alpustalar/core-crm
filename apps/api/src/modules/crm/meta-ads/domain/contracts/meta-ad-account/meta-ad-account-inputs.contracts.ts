import { LogSource } from '@src/domain/constants/log-action.constant';

export interface CreateMetaAdAccountProps {
  id?: string;
  clinicId: string;

  // Meta'dan gelen teknik alanlar
  adAccountId: string;
  accessToken: string;
  pageId?: string | null;

  businessName?: string | null;

  // Token süresi yönetimi
  tokenExpiresAt?: Date | null;

  // Audit izi — event entity içinde raise edildiği için aktör bilgisi props ile taşınır
  actorId?: string;
  logSource?: LogSource;
}

/** Hesap bağlantısını kesme (deactivate) — yalnız audit izi taşır. */
export interface DeactivateMetaAdAccountProps {
  actorId?: string;
  logSource?: LogSource;
}
