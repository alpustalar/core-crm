import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookHotelCommand } from './book-hotel.command';
import { BookHotelResponse } from './book-hotel.response';
import {
  HOTELBEDS_API_SERVICE,
  IHotelbedsApiService,
} from '@modules/crm/health-tourism/hotel/domain/interfaces/hotelbeds-api.interface';
import {
  HOTELBEDS_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsBookingCommandRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { Currency } from '@src/domain/value-objects/currency.vo';

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

    const apiResult = await this.hotelbedsApi.createBooking({
      holderName: dto.holderName,
      holderSurname: dto.holderSurname,
      rooms: dto.rooms,
      clientReference: randomUUID(),
      remarks: dto.remarks,
    });

    const bookingId = randomUUID();

    // TODO: entity'de static create methodu oluşturulacak. save ile kayıt yapılır. create methodunda domain event pushlanıcak

    await this.txManager.run(async () => {
      return this.bookingCommandRepo.create({
        id: bookingId,
        reference: apiResult.reference,
        hotelCode: dto.hotelCode,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        totalNet: apiResult.totalNet,
        currency: Currency.create(apiResult.currency).orThrow().value,
        holderName: dto.holderName,
        holderSurname: dto.holderSurname,
        rooms: apiResult.rooms,
        patientId: dto.patientId,
        leadId: dto.leadId,
        remarks: dto.remarks,
        serviceFee: dto.serviceFee,
        organizationId: dto.organizationId,
        clinicId: dto.clinicId,
      });
    });

    return bookingId;
  }
}
