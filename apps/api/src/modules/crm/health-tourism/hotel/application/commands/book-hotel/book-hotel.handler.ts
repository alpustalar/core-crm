import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
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
import { HotelbedsBooking } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-booking.entity';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { HotelbedsBookingStatusSchema } from '@shared';

@CommandHandler(BookHotelCommand)
export class BookHotelHandler
  implements ICommandHandler<BookHotelCommand, BookHotelResponse>
{
  constructor(
    @Inject(HOTELBEDS_API_SERVICE)
    private readonly hotelbedsApi: IHotelbedsApiService,
    @Inject(HOTELBEDS_BOOKING_COMMAND_REPOSITORY)
    private readonly hotelbedsBookingCommandRepo: IHotelbedsBookingCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: BookHotelCommand): Promise<BookHotelResponse> {
    const { dto } = command;

    const bookingId = UUID.generate();

    const apiResult = await this.hotelbedsApi.createBooking({
      holderName: dto.holderName,
      holderSurname: dto.holderSurname,
      rooms: dto.rooms,
      clientReference: bookingId.value,
      remarks: dto.remarks,
    });

    const bookingHotel = HotelbedsBooking.create({
      id: bookingId.value,
      reference: apiResult.reference,
      clientReference: bookingId.value,
      hotelCode: dto.hotelCode,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      totalNet: apiResult.totalNet,
      currency: apiResult.currency,
      holderName: dto.holderName,
      holderSurname: dto.holderSurname,
      rooms: apiResult.rooms,
      patientId: dto.patientId,
      leadId: dto.leadId,
      remarks: dto.remarks,
      serviceFee: dto.serviceFee,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
      status: HotelbedsBookingStatusSchema.enum.PENDING,
    });

    await this.txManager.run(async () => {
      return this.hotelbedsBookingCommandRepo.create(bookingHotel);
    });

    return bookingId.value;
  }
}
