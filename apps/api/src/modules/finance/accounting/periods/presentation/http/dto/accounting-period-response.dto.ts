import { Expose, Type } from 'class-transformer';
import { FinanceResponseGroups } from '@modules/finance/shared/domain/finance.contracts';
import { AccountingPeriodStatusType } from '@input-type-schemas/AccountingPeriodStatusSchema';

const { INTERNAL, FINANCIAL, MANAGEMENT, ADMIN } = FinanceResponseGroups;

/**
 * Muhasebe dönemi. Dönemin açık/kapalı olduğu bilgisi kayıt girmeye çalışan
 * klinik personeli için de anlamlıdır (fiş hangi döneme düşecek) — bu yüzden
 * INTERNAL'a açıktır; organizasyon bağı ve denetim damgaları yönetime özel.
 */
export class AccountingPeriodResponseDto {
  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  id: string;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  clinicId: string;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  year: number;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  status: AccountingPeriodStatusType;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  @Type(() => Date)
  startsAt: Date;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  @Type(() => Date)
  endsAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  organizationId: string;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
