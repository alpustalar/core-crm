import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CancelTransferBookingCommand } from './cancel-transfer-booking.command';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  HotelbedsTransferNotFound
} from '@modules/crm/health-tourism/transfer/domain/exceptions/hotelbeds-transfer.exceptions';
import {
  HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
  IHotelbedsTransferBookingCommandRepository,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.command.repository';

@CommandHandler(CancelTransferBookingCommand)
export class CancelTransferBookingHandler
  implements ICommandHandler<CancelTransferBookingCommand, void>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_API_SERVICE)
    private readonly transferApi: IHotelbedsTransferApiService,
    @Inject(HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY)
    private readonly hotelbedsTransferBookingRepo: IHotelbedsTransferBookingCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelTransferBookingCommand): Promise<void> {
    const { dto } = command;

    const booking = await this.hotelbedsTransferBookingRepo.findByReference(
      dto.reference
    );

    if (!booking) throw new HotelbedsTransferNotFound();

    await this.transferApi.cancelBooking(dto.language, dto.reference);

    await this.txManager.run(async () => {
      booking.cancel();
      await this.hotelbedsTransferBookingRepo.update(booking);
    });
  }
}
