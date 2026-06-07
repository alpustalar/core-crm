export interface HotelBookingResponse {
  id: string;
  reference: string;
  hotelCode: string;
  hotelName?: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalNet: number;
  currency: string;
  holderName: string;
  holderSurname: string;
  patientId: string | null;
  leadId: string | null;
  createdAt: Date;
}
