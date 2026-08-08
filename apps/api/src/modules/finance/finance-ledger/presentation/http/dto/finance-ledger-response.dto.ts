import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { LedgerCategoryType as LedgerCategory } from '@shared/generated-zod/inputTypeSchemas/LedgerCategorySchema';
import { LedgerTypeType as LedgerType } from '@shared/generated-zod/inputTypeSchemas/LedgerTypeSchema';
import { LedgerSourceType as LedgerSource } from '@shared/generated-zod/inputTypeSchemas/LedgerSourceSchema';
import { LedgerStatusType as LedgerStatus } from '@shared/generated-zod/inputTypeSchemas/LedgerStatusSchema';

const { INTERNAL, MANAGEMENT, FINANCIAL, ADMIN } = ResponseGroups;

export class FinanceLedgerResponseDto {
  @Expose() id: string;
  @Expose() organizationId: string;
  @Expose() clinicId: string;
  @Expose() patientId: string | null;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  type: LedgerType;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  source: LedgerSource;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  category: LedgerCategory;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  status: LedgerStatus;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  description: string | null;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  documentNo: string | null;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  @Type(() => Date)
  entryDate: Date;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  paymentId: string | null;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  installmentId: string | null;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  performedById: string | null;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  currency: string;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  @Type(() => Number)
  amount: number;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  @Type(() => Number)
  taxRate: number;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  @Type(() => Number)
  taxAmount: number;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
