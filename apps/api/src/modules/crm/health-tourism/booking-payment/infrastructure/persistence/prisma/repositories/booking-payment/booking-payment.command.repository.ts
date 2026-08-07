import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { Prisma } from '@prisma/client';
import { IBookingPaymentCommandRepository } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.command.repository';

@Injectable()
export class BookingPaymentCommandRepository
  extends BaseCommandRepository<BookingPayment>
  implements IBookingPaymentCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async update(entity: BookingPayment): Promise<BookingPayment> {
    const data = entity.toPersistence();
    const raw = await this.db.bookingPayment.update({
      where: { id: data.id },
      data: {
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

  async create(entity: BookingPayment): Promise<BookingPayment> {
    const create = entity.toPersistence();
    const { intent, ...rest } = create;

    const data = {
      ...rest,
      intent: intent ?? Prisma.JsonNull,
    };

    const raw = await this.db.bookingPayment.create({ data });
    entity.flushEvents();
    return new BookingPayment(raw);
  }

  async findById(id: string): Promise<BookingPayment | null> {
    const raw = await this.db.bookingPayment.findUnique({ where: { id } });
    return raw ? new BookingPayment(raw) : null;
  }

  async findByBookingId(bookingId: string): Promise<BookingPayment | null> {
    const raw = await this.db.bookingPayment.findFirst({
      where: { bookingId },
    });
    return raw ? new BookingPayment(raw) : null;
  }
}
