import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CancelTransferBookingCommand } from './cancel-transfer-booking.command';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/domain/interfaces/hotelbeds-transfer-api.interface';
import {
  HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  IHotelbedsTransferBookingCommandRepository,
  IHotelbedsTransferBookingQueryRepository,
} from '@modules/crm/health-tourism/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(CancelTransferBookingCommand)
export class CancelTransferBookingHandler
  implements ICommandHandler<CancelTransferBookingCommand, void>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_API_SERVICE)
    private readonly transferApi: IHotelbedsTransferApiService,

    @Inject(HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsTransferBookingQueryRepository,

    @Inject(HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY)
    private readonly bookingCommandRepo: IHotelbedsTransferBookingCommandRepository,

    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: CancelTransferBookingCommand): Promise<void> {
    const { dto } = command;

    const booking = await this.bookingQueryRepo.findByReference(dto.reference);
    if (!booking) {
      throw new NotFoundException(
        `Transfer rezervasyonu bulunamadı: ${dto.reference}`,
      );
    }

    await this.transferApi.cancelBooking(dto.language, dto.reference);

    await this.txManager.run(async () => {
      booking.cancel();
      await this.bookingCommandRepo.save(booking);
    });
  }
}
