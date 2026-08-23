import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CancelTransferBookingCommand } from './cancel-transfer-booking.command';
import {
  HOTELBEDS_TRANSFER_API_SERVICE,
  IHotelbedsTransferApiService,
} from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { HotelbedsTransferNotFound } from '@modules/crm/health-tourism/transfer/domain/exceptions/hotelbeds-transfer.exceptions';
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

  /**
   * Önce **kilitli claim** (durum kontrolü + CANCELLED yazımı), sonra HotelBeds
   * iptal çağrısı. Sıra bilinçli: durum kontrolü dış çağrının arkasında kalsaydı
   * iki eşzamanlı iptal isteği de rezervasyonu "aktif" görüp HotelBeds'e iki kez
   * iptal (ve arkasındaki iade akışını iki kez) tetiklerdi.
   */
  async execute(command: CancelTransferBookingCommand): Promise<void> {
    const { dto } = command;

    const claimed = await this.txManager.run(async () => {
      const booking =
        await this.hotelbedsTransferBookingRepo.findByReferenceForUpdate(
          dto.reference
        );

      if (!booking) throw new HotelbedsTransferNotFound();

      if (booking.validate.status.isCancelled.value) return false;

      booking.cancel();
      await this.hotelbedsTransferBookingRepo.update(booking);

      return true;
    });

    if (!claimed) return;

    await this.transferApi.cancelBooking(dto.language, dto.reference);
  }
}
