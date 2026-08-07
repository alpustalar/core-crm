import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BookingPayment } from '@shared';
import { IBookingPaymentQueryRepository } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.query.repository';

@Injectable()
export class BookingPaymentQueryRepository
  extends BaseRepository
  implements IBookingPaymentQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<BookingPayment | null> {
    return this.db.bookingPayment.findUnique({ where: { id } });
  }

  findByStripeSessionId(sessionId: string): Promise<BookingPayment | null> {
    return this.db.bookingPayment.findUnique({
      where: { stripeSessionId: sessionId },
    });
  }

  findByIyzicoConversationId(
    conversationId: string
  ): Promise<BookingPayment | null> {
    return this.db.bookingPayment.findUnique({
      where: { iyzicoConversationId: conversationId },
    });
  }
}
