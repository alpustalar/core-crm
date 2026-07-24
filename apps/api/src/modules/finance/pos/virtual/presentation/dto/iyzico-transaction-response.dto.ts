import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { IyzicoTransactionStatusType as IyzicoTransactionStatus } from '@input-type-schemas/IyzicoTransactionStatusSchema';

const { INTERNAL, MANAGEMENT, FINANCIAL, ADMIN } = ResponseGroups;

export class IyzicoTransactionResponseDto {
  @Expose() id: string;
  @Expose() installmentId: string;

  // --- Genel Durum ve Takip Bilgileri (İç Operasyon ve Üst Roller) ---
  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  conversationId: string;

  @Expose({ groups: [INTERNAL, FINANCIAL, MANAGEMENT, ADMIN] })
  status: IyzicoTransactionStatus;

  // --- Gateway Referansları (Sadece Finans, Yönetim ve Admin) ---
  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  token: string | null;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  iyzicoPaymentId: string | null;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  iyzicoPaymentTransactionId: string | null;

  // --- Hata Yönetim Alanları (Sadece Finans, Yönetim ve Admin) ---
  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  errorCode: string | null;

  @Expose({ groups: [FINANCIAL, MANAGEMENT, ADMIN] })
  errorMessage: string | null;

  // --- Gateway Ham Logları (Sadece Yönetim ve Admin) ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  rawResponse: any | null;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
