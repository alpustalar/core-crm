import { Expose, Type } from 'class-transformer';
import { ExceptionTypeType as ExceptionType } from '@input-type-schemas/ExceptionTypeSchema';
import { ProviderResponseGroups } from '@modules/clinical/provider/domain/contracts/provider.contracts';

const { INTERNAL, MANAGEMENT, DATA_OWNER, ADMIN } = ProviderResponseGroups;

export class ProviderExceptionResponseDto {
  @Expose() id: string;
  @Expose() providerId: string;
  @Expose() type: ExceptionType;

  // --- Zaman Aralığı (Herkese Açık) ---
  @Expose()
  @Type(() => Date)
  startTime: Date;

  @Expose()
  @Type(() => Date)
  endTime: Date;

  @Expose({ groups: [ADMIN, INTERNAL, MANAGEMENT, DATA_OWNER] })
  reason: string | null;

  @Expose({ groups: [ADMIN, MANAGEMENT, DATA_OWNER] })
  @Type(() => Date)
  createdAt: Date;
}
