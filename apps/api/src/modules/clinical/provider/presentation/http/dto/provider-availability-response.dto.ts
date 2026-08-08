import { Expose, Type } from 'class-transformer';
import { ProviderResponseGroups } from '@modules/clinical/provider/domain/contracts/provider.contracts';

const { INTERNAL, MANAGEMENT, DATA_OWNER, ADMIN } = ProviderResponseGroups;

export class ProviderAvailabilityResponseDto {
  @Expose() id: string;
  @Expose() providerId: string;
  @Expose() dayOfWeek: number;
  @Expose() startMinute: number;
  @Expose() endMinute: number;

  // --- Mola Bilgileri ---
  @Expose({ groups: [ADMIN, INTERNAL, MANAGEMENT, DATA_OWNER] })
  breakStartMinute: number | null;

  @Expose({ groups: [ADMIN, INTERNAL, MANAGEMENT, DATA_OWNER] })
  breakEndMinute: number | null;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  @Type(() => Date)
  updatedAt: Date | null;
}
