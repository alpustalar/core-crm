import { ICommand } from '@nestjs/cqrs';

/**
 * Rezervasyon iptal edilince müşteriye iade başlatır. `bookingId` = HotelBeds rezervasyonunun
 * dahili kaydı (BookingPayment.bookingId). Ödeme hangi sağlayıcıyla alındıysa o sağlayıcıdan
 * iade edilir. v1: tam satış tutarı iade (HotelBeds iptal cezası v1'de yok sayılır — sonra).
 */
export class RefundBookingPaymentCommand implements ICommand {
  constructor(
    public readonly bookingId: string,
    public readonly reason?: string
  ) {}
}
