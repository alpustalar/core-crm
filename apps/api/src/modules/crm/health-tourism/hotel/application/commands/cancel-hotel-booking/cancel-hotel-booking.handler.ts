import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CancelHotelBookingCommand } from './cancel-hotel-booking.command';
import {
  HOTELBEDS_API_SERVICE,
  IHotelbedsApiService,
} from '@modules/crm/health-tourism/hotel/domain/interfaces/hotelbeds-api.interface';
import {
  HOTELBEDS_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsBookingCommandRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(CancelHotelBookingCommand)
export class CancelHotelBookingHandler
  implements ICommandHandler<CancelHotelBookingCommand, void>
{
  constructor(
    @Inject(HOTELBEDS_API_SERVICE)
    private readonly hotelbedsApi: IHotelbedsApiService,

    @Inject(HOTELBEDS_BOOKING_COMMAND_REPOSITORY)
    private readonly bookingCommandRepo: IHotelbedsBookingCommandRepository,

    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelHotelBookingCommand): Promise<void> {
    const { dto } = command;

    const booking = await this.bookingCommandRepo.findById(dto.bookingId);
    if (!booking) throw new NotFoundException('Rezervasyon bulunamadı.');

    await this.hotelbedsApi.cancelBooking(booking.reference);

    booking.cancel();

    await this.txManager.run(async () => {
      await this.bookingCommandRepo.save(booking);
    });
  }
}
