import { Expose, Type } from 'class-transformer';
import { ProviderResponseGroups } from '@modules/clinical/provider/domain/contracts/provider.contracts';

const { INTERNAL, MANAGEMENT, DATA_OWNER } = ProviderResponseGroups;

export class ProviderShiftResponseDto {
  @Expose() id: string;
  @Expose() providerId: string;

  // --- Vardiya Günü ve Çalışma Saatleri (Herkese Açık) ---
  @Expose()
  @Type(() => Date)
  date: Date;

  @Expose()
  startMinute: number;

  @Expose()
  endMinute: number;

  // --- Mola Bilgileri (Sadece Klinik İçi, Yönetim veya Personelin Kendisi) ---
  @Expose({ groups: [INTERNAL, MANAGEMENT, DATA_OWNER] })
  breakStartMinute: number | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, DATA_OWNER] })
  breakEndMinute: number | null;
}
