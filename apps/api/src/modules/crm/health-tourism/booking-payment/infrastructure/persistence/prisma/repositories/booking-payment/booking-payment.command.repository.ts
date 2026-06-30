import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IBookingPaymentCommandRepository } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';

@Injectable()
export class BookingPaymentCommandRepository
  extends BaseRepository
  implements IBookingPaymentCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: BookingPayment): Promise<BookingPayment> {
    const data = entity.toPersistence();
    const create = data as unknown as Prisma.BookingPaymentUncheckedCreateInput;

    const raw = await this.db.bookingPayment.upsert({
      where: { id: data.id },
      create,
      update: {
        status: data.status,
        iyzicoConversationId: data.iyzicoConversationId,
        iyzicoToken: data.iyzicoToken,
        iyzicoUrl: data.iyzicoUrl,
        stripeSessionId: data.stripeSessionId,
        stripeUrl: data.stripeUrl,
        paidProvider: data.paidProvider,
        paidProviderRef: data.paidProviderRef,
        paidAt: data.paidAt,
        bookingReference: data.bookingReference,
        bookingId: data.bookingId,
        failureReason: data.failureReason,
        updatedAt: data.updatedAt,
      },
    });

    entity.flushEvents();
    return new BookingPayment(raw);
  }
}
