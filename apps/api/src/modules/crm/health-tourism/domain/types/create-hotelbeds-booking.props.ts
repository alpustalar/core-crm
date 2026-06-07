export interface CreateHotelbedsBookingProps {
  id: string;
  reference: string;
  hotelCode: string;
  checkIn: Date;
  checkOut: Date;
  totalNet: number;
  currency: string;
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
