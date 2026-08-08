import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { HotelbedsBooking } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-booking.entity';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { IHotelbedsBookingCommandRepository } from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking/hotelbeds-booking.command.repository';

@Injectable()
export class HotelbedsBookingCommandRepository
  extends BaseCommandRepository<HotelbedsBooking>
  implements IHotelbedsBookingCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const raw = await this.db.hotelbedsBooking.findUnique({ where: { id } });
    return raw ? new HotelbedsBooking(raw) : null;
  }

  async create(entity: HotelbedsBooking): Promise<HotelbedsBooking> {
    const persistenceData = entity.toPersistence();
    const { rooms, ...rest } = persistenceData;

    const data = {
      ...rest,
      rooms: rooms as Prisma.InputJsonValue,
    };

    const raw = await this.db.hotelbedsBooking.create({ data });
    entity.flushEvents();
    return new HotelbedsBooking(raw);
  }

  async sync(booking: HotelbedsBooking): Promise<HotelbedsBooking> {
    const toPersistence = booking.toPersistence();

    const create = {
      ...toPersistence,
      rooms: toPersistence.rooms as Prisma.InputJsonValue,
    };

    const { id, ...update } = create;
    const raw = await this.db.hotelbedsBooking.upsert({
      where: { id },
      create,
      update,
    });

    booking.flushEvents();
    return new HotelbedsBooking(raw);
  }

  async update(booking: HotelbedsBooking): Promise<HotelbedsBooking> {
    const toPersistence = booking.toPersistence();

    const data = {
      ...toPersistence,
      rooms: toPersistence.rooms as Prisma.InputJsonValue,
    };

    const { id, ...update } = data;
    const raw = await this.db.hotelbedsBooking.update({
      where: { id },
      data: update,
    });

    booking.flushEvents();
    return new HotelbedsBooking(raw);
  }
}
