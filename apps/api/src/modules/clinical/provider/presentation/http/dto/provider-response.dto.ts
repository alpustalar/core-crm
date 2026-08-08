import { Expose, Type } from 'class-transformer';
import { ProviderResponseGroups } from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { OperationModeType } from '@input-type-schemas/OperationModeSchema';

const { MANAGEMENT, DATA_OWNER, INTERNAL, ADMIN } = ProviderResponseGroups;

export class ProviderResponseDto {
  // --- Genel/Temel Alanlar (Herkese Açık) ---
  @Expose() id: string;
  @Expose() clinicId: string;
  @Expose() userId: string;
  @Expose() providerTitleId: string | null;
  @Expose() providerSpecialtyId: string | null;
  @Expose() operationMode: OperationModeType;
  @Expose() isActive: boolean;
  @Expose() acceptsConsultation: boolean;

  // --- İletişim Bilgileri (Klinik İçi veya Yönetim Görebilir) ---
  @Expose({
    groups: [ADMIN, INTERNAL, MANAGEMENT, DATA_OWNER],
  })
  publicPhone: string | null;

  @Expose({
    groups: [ADMIN, INTERNAL, MANAGEMENT, DATA_OWNER],
  })
  publicEmail: string | null;

  // --- Hassas / Resmi Belgeler (Sadece Yönetim ve Veri Sahibi Görebilir) ---
  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  diplomaNo: string | null;

  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  hlrNo: string | null;

  @Expose({ groups: [ADMIN] })
  sectorId: string | null;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  @Type(() => Date)
  updatedAt: Date;
}
