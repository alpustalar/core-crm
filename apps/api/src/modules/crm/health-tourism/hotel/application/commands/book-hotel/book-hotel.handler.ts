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
    const { data } = command;

    const generatedBookingUUID = UUID.generate();

    const apiResult = await this.hotelbedsApi.createBooking({
      holderName: data.holderName,
      holderSurname: data.holderSurname,
      rooms: data.rooms,
      clientReference: generatedBookingUUID.value,
      remarks: data.remarks,
    });

    const bookingHotel = HotelbedsBooking.create({
      id: generatedBookingUUID.value,
      reference: apiResult.reference,
      clientReference: generatedBookingUUID.value,
      hotelCode: data.hotelCode,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      totalNet: apiResult.totalNet,
      currency: apiResult.currency,
      holderName: data.holderName,
      holderSurname: data.holderSurname,
      rooms: apiResult.rooms,
      patientId: data.patientId,
      leadId: data.leadId,
      remarks: data.remarks,
      serviceFee: data.serviceFee,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
      status: HotelbedsBookingStatusSchema.enum.PENDING,
    });

    await this.txManager.run(async () => {
      return this.hotelbedsBookingCommandRepo.create(bookingHotel);
    });

    return generatedBookingUUID.value;
  }
}
