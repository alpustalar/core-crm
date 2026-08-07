import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CancelHotelBookingCommand } from './cancel-hotel-booking.command';
import {
  HOTELBEDS_API_SERVICE,
  IHotelbedsApiService,
} from '@modules/crm/health-tourism/hotel/domain/interfaces/hotelbeds-api.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  HOTELBEDS_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsBookingCommandRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking/hotelbeds-booking.command.repository';

@CommandHandler(CancelHotelBookingCommand)
export class CancelHotelBookingHandler
  implements ICommandHandler<CancelHotelBookingCommand, void>
{
  constructor(
    @Inject(HOTELBEDS_API_SERVICE)
    private readonly hotelbedsApi: IHotelbedsApiService,
    @Inject(HOTELBEDS_BOOKING_COMMAND_REPOSITORY)
    private readonly hotelbedsBookingRepo: IHotelbedsBookingCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelHotelBookingCommand): Promise<void> {
    const { dto } = command;

    const booking = await this.hotelbedsBookingRepo.findById(dto.bookingId);
    if (!booking) throw new NotFoundException('Rezervasyon bulunamadı.');

    // TODO: saga/outbox kullanıcaz. nest cqrs'in sagasını kullan. kullanıcıya direkt talebiniz alındı dön. kuyruğa al

    await this.hotelbedsApi.cancelBooking(booking.reference);

    booking.cancel();

    await this.txManager.run(async () => {
      await this.hotelbedsBookingRepo.update(booking);
    });
  }
}
