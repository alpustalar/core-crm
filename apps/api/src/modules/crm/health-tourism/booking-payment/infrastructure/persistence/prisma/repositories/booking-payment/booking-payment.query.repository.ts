import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IBookingPaymentQueryRepository } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';

@Injectable()
export class BookingPaymentQueryRepository
  extends BaseRepository
  implements IBookingPaymentQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<BookingPayment | null> {
    const raw = await this.db.bookingPayment.findUnique({ where: { id } });
    return raw ? new BookingPayment(raw) : null;
  }

  async findByStripeSessionId(
    sessionId: string
  ): Promise<BookingPayment | null> {
    const raw = await this.db.bookingPayment.findUnique({
      where: { stripeSessionId: sessionId },
    });
    return raw ? new BookingPayment(raw) : null;
  }

  async findByIyzicoConversationId(
    conversationId: string
  ): Promise<BookingPayment | null> {
    const raw = await this.db.bookingPayment.findUnique({
      where: { iyzicoConversationId: conversationId },
    });
    return raw ? new BookingPayment(raw) : null;
  }
}
