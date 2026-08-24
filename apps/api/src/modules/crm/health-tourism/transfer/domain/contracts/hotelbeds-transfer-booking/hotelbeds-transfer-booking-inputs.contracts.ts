import { HotelbedsTransferBookingStatusType } from '@input-type-schemas/HotelbedsTransferBookingStatusSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { JsonValueType } from '@input-type-schemas/JsonValueSchema';
import { Decimal } from 'decimal.js';

export interface CreateTransferBookingProps {
  id?: string;
  reference: string;
  clientReference?: string | null;
  status: HotelbedsTransferBookingStatusType;

  // Holder (Rezervasyonu yapan kişi) Bilgileri
  holderName: string;
  holderSurname: string;
  holderEmail: string;
  holderPhone: string;

  // Transfer Detayları ve Finansal Veriler
  transfers: JsonValueType;
  totalAmount: number | Decimal; // Decimal veya Money desteği
  currency: CurrencyType; // ISO Currency Code

  remarks?: string | null;

  // İç İlişkiler
  organizationId: string;
  clinicId?: string | null;
  patientId?: string | null;
  leadId?: string | null;
}

export interface UpdateTransferHolderProps {
  holderName: string;
  holderSurname: string;
  holderEmail: string;
  holderPhone: string;
  remarks?: string | null;
}
