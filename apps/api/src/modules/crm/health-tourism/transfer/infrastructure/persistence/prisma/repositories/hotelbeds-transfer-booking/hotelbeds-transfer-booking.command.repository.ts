import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IHotelbedsTransferBookingCommandRepository } from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';
import { CreateTransferBookingProps } from '@modules/crm/health-tourism/transfer/domain/types/create-transfer-booking.props';

@Injectable()
export class HotelbedsTransferBookingCommandRepository
  extends BaseRepository
  implements IHotelbedsTransferBookingCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    props: CreateTransferBookingProps
  ): Promise<HotelbedsTransferBooking> {
    const raw = await this.db.hotelbedsTransferBooking.create({
      data: {
        id: props.id,
        reference: props.reference,
        clientReference: props.clientReference ?? null,
        holderName: props.holderName,
        holderSurname: props.holderSurname,
        holderEmail: props.holderEmail,
        holderPhone: props.holderPhone,
        transfers:
          (props.transfers as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        totalAmount: new Decimal(props.totalAmount),
        currency: props.currency,
        remarks: props.remarks ?? null,
        organizationId: props.organizationId,
        clinicId: props.clinicId ?? null,
        patientId: props.patientId ?? null,
        leadId: props.leadId ?? null,
      },
    });
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
