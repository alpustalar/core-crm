import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IHotelbedsBookingCommandRepository } from '@modules/crm/health-tourism/domain/repositories/hotelbeds-booking.repository.interface';
import { HotelbedsBooking } from '@modules/crm/health-tourism/domain/entities/hotelbeds-booking.entity';
import { CreateHotelbedsBookingProps } from '@modules/crm/health-tourism/domain/types/create-hotelbeds-booking.props';

@Injectable()
export class HotelbedsBookingCommandRepository
  extends BaseRepository
  implements IHotelbedsBookingCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateHotelbedsBookingProps): Promise<HotelbedsBooking> {
    const raw = await this.db.hotelbedsBooking.create({
      data: {
        id: props.id,
        reference: props.reference,
        hotelCode: props.hotelCode,
        checkIn: props.checkIn,
        checkOut: props.checkOut,
        totalNet: new Decimal(props.totalNet),
        currency: props.currency,
        holderName: props.holderName,
        holderSurname: props.holderSurname,
        rooms: (props.rooms as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        patientId: props.patientId ?? null,
        leadId: props.leadId ?? null,
        remarks: props.remarks ?? null,
        serviceFee:
          props.serviceFee != null ? new Decimal(props.serviceFee) : null,
        organizationId: props.organizationId,
        clinicId: props.clinicId ?? null,
      },
    });
    return new HotelbedsBooking(raw);
  }

  async save(booking: HotelbedsBooking): Promise<HotelbedsBooking> {
    const data = booking.toPersistence();
    const writeData = {
      ...data,
      rooms: data.rooms as Prisma.InputJsonValue,
    };
    const raw = await this.db.hotelbedsBooking.upsert({
      where: { id: data.id },
      create: writeData,
      update: writeData,
    });
    booking.flushEvents();
    return new HotelbedsBooking(raw);
  }
}
