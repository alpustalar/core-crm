import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';

const { INTERNAL, MANAGEMENT, ADMIN } = ResponseGroups;

export class MetaAdAccountResponseDto {
  @Expose() id: string;
  @Expose() clinicId: string;

  // --- Genel Hesap Görünümü (İç Ekip, Yönetim ve Admin) ---
  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  adAccountId: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  pageId: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  businessName: string | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  isActive: boolean;

  // --- Token Güvenliği & Finansal Senkronizasyon (Yönetim ve Admin) ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  accessToken: string;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  tokenExpiresAt: Date | null;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  lastSyncAt: Date | null;

  // --- Audit Zaman Damgaları (Yönetim ve Admin) ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
