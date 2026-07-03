import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IHotelbedsBookingCommandRepository } from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';
import { HotelbedsBooking } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-booking.entity';
import { CreateHotelbedsBookingData } from '@modules/crm/health-tourism/hotel/domain/hotel.contracts';

@Injectable()
export class HotelbedsBookingCommandRepository
  extends BaseRepository
  implements IHotelbedsBookingCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateHotelbedsBookingData): Promise<HotelbedsBooking> {
    const raw = await this.db.hotelbedsBooking.create({
      data: {
        id: data.id,
        reference: data.reference,
        hotelCode: data.hotelCode,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalNet: new Decimal(data.totalNet),
        currency: data.currency,
        holderName: data.holderName,
        holderSurname: data.holderSurname,
        rooms: (data.rooms as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        patientId: data.patientId ?? null,
        leadId: data.leadId ?? null,
        remarks: data.remarks ?? null,
        serviceFee:
          data.serviceFee != null ? new Decimal(data.serviceFee) : null,
        organizationId: data.organizationId,
        clinicId: data.clinicId,
      },
    });
    return new HotelbedsBooking(raw);
  }

  async save(booking: HotelbedsBooking): Promise<HotelbedsBooking> {
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
}
