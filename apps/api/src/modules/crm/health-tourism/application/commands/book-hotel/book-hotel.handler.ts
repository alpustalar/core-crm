import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookHotelCommand } from './book-hotel.command';
import { BookHotelResponse } from './book-hotel.response';
import {
  HOTELBEDS_API_SERVICE,
  IHotelbedsApiService,
} from '@modules/crm/health-tourism/domain/interfaces/hotelbeds-api.interface';
import {
  HOTELBEDS_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsBookingCommandRepository,
} from '@modules/crm/health-tourism/domain/repositories/hotelbeds-booking.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(BookHotelCommand)
export class BookHotelHandler
  implements ICommandHandler<BookHotelCommand, BookHotelResponse>
{
  constructor(
    @Inject(HOTELBEDS_API_SERVICE)
    private readonly hotelbedsApi: IHotelbedsApiService,

    @Inject(HOTELBEDS_BOOKING_COMMAND_REPOSITORY)
    private readonly bookingCommandRepo: IHotelbedsBookingCommandRepository,

    private readonly txManager: TransactionManager
  ) {}

  async execute(command: BookHotelCommand): Promise<BookHotelResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    const rateKey = dto.rooms[0].rateKey;
    const finalRate = await this.resolveRate(rateKey);

    const result = await this.hotelbedsApi.createBooking({
      holderName: dto.holderName,
      holderSurname: dto.holderSurname,
      rooms: dto.rooms,
      clientReference: randomUUID(),
      remarks: dto.remarks,
    });

    const bookingId = randomUUID();

    const booking = await this.txManager.run(async () => {
      return this.bookingCommandRepo.create({
        id: bookingId,
        reference: result.reference,
        hotelCode: dto.hotelCode,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        totalNet: result.totalNet,
        currency: result.currency,
        holderName: dto.holderName,
        holderSurname: dto.holderSurname,
        rooms: result.rooms,
        patientId: dto.patientId,
        leadId: dto.leadId,
        remarks: dto.remarks,
        serviceFee: dto.serviceFee,
        organizationId: actor.organizationId!,
        clinicId: actor.clinicId ?? undefined,
      });
    });

    return {
      id: booking.id,
      reference: booking.reference,
      totalNet: Number(booking.totalNet),
      currency: booking.currency,
      status: booking.status,
    };
  }

  private async resolveRate(
    rateKey: string
  ): Promise<{ net: number; currency: string }> {
    const checked = await this.hotelbedsApi.checkRate(rateKey);
    return { net: checked.net, currency: checked.currency };
  }
}
