import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreateHotelbedsBookingProps {
  id: string;
  reference: string;
  hotelCode: string;
  checkIn: Date;
  checkOut: Date;
  totalNet: number;
  currency: CurrencyType;
  holderName: string;
  holderSurname: string;
  rooms: unknown;
  patientId?: string;
  leadId?: string;
  remarks?: string;
  serviceFee?: number;
  organizationId: string;
  clinicId?: string;
}
