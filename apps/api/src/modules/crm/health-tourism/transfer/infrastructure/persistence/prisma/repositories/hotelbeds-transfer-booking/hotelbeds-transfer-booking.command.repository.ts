import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IHotelbedsTransferBookingCommandRepository } from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';

@Injectable()
export class HotelbedsTransferBookingCommandRepository
  extends BaseRepository
  implements IHotelbedsTransferBookingCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<HotelbedsTransferBooking | null> {
    const raw = await this.db.hotelbedsTransferBooking.findUnique({
      where: { id },
    });
    return raw ? new HotelbedsTransferBooking(raw) : null;
  }

  async create(
    booking: HotelbedsTransferBooking
  ): Promise<HotelbedsTransferBooking> {
    const data = booking.toPersistence();
    const raw = await this.db.hotelbedsTransferBooking.create({
      data: {
        ...data,
        transfers: data.transfers as Prisma.InputJsonValue,
      },
    });
    booking.flushEvents();
    return new HotelbedsTransferBooking(raw);
  }

  async save(
    booking: HotelbedsTransferBooking
  ): Promise<HotelbedsTransferBooking> {
    const data = booking.toPersistence();
    const raw = await this.db.hotelbedsTransferBooking.upsert({
      where: { id: data.id },
      create: {
        ...data,
        transfers: data.transfers as Prisma.InputJsonValue,
      },
      update: {
        ...data,
        transfers: data.transfers as Prisma.InputJsonValue,
      },
    });
    booking.flushEvents();
    return new HotelbedsTransferBooking(raw);
  }
}
